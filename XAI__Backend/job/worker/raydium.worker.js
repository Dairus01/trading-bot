const logger = require("log4js").getLogger("newRaydiumPool-worker");
const SOL_DECIMALS = 9;
const { Connection, PublicKey } = require("@solana/web3.js");
const {
  MARKET_STATE_LAYOUT_V3,
  TOKEN_PROGRAM_ID,
} = require("@raydium-io/raydium-sdk");
const {
  RAYDIUM_POOL_V4_PROGRAM_ID,
  SOL_RPC,
  SOL,
  PUMPFUN_RAYDIUM_MIGRATIOM,
  DISCORD_CHANNEL_ID,
} = require("../../configs/env");
const raydiumNewPoolModel = require("../../app/model/raydiumNewPool.model");

const BuyCondition = require("../../app/utils/buyConditions");
const RaydiumAmmServiceV2 = require("../../app/raydiumServices/raydium_helper");
const { addTokenForAutoBuy } = require("../add_task");
const { Client, GatewayIntentBits } = require("discord.js");

class NewRaydiumPoolWorker {
  constructor() {
    this.connection = new Connection(SOL_RPC, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });
    this.buyCondition = new BuyCondition();
    this.raydiumAmmService = new RaydiumAmmServiceV2();
  }

  async findLogEntry(needle, logEntries) {
    for (let i = 0; i < logEntries.length; ++i) {
      if (logEntries[i].includes(needle)) {
        return logEntries[i];
      }
    }
    return null;
  }

  async findInstructionByProgramId(instructions, programId) {
    for (let i = 0; i < instructions.length; i++) {
      if (instructions[i].programId.equals(programId)) {
        return instructions[i];
      }
    }

    return null;
  }

  async findInitializeMintInInnerInstructionsByMintAddress(
    innerInstructions,
    mintAddress
  ) {
    for (let i = 0; i < innerInstructions.length; i++) {
      for (let y = 0; y < innerInstructions[i].instructions.length; y++) {
        const instruction = innerInstructions[i].instructions[y];
        if (!instruction.parsed) continue;
        if (
          instruction.parsed.type === "initializeMint" &&
          instruction.parsed.info.mint === mintAddress.toBase58()
        ) {
          return instruction;
        }
      }
    }

    return null;
  }

  async findMintToInInnerInstructionsByMintAddress(
    innerInstructions,
    mintAddress
  ) {
    for (let i = 0; i < innerInstructions.length; i++) {
      for (let y = 0; y < innerInstructions[i].instructions.length; y++) {
        const instruction = innerInstructions[i].instructions[y];
        if (!instruction.parsed) continue;
        if (
          instruction.parsed.type === "mintTo" &&
          instruction.parsed.info.mint === mintAddress.toBase58()
        ) {
          return instruction;
        }
      }
    }

    return null;
  }

  async findTransferInstructionInInnerInstructionsByDestination(
    innerInstructions,
    destinationAccount,
    programId
  ) {
    for (let i = 0; i < innerInstructions.length; i++) {
      for (let y = 0; y < innerInstructions[i].instructions.length; y++) {
        const instruction = innerInstructions[i].instructions[y];
        if (!instruction.parsed) continue;
        if (
          instruction.parsed.type === "transfer" &&
          instruction.parsed.info.destination ===
            destinationAccount.toBase58() &&
          (!programId || instruction.programId.equals(programId))
        ) {
          return instruction;
        }
      }
    }

    return null;
  }

  async extractLPInitializationLogEntryInfoFromLogEntry(lpLogEntry) {
    const lpInitializationLogEntryInfoStart = lpLogEntry.indexOf("{");

    return JSON.parse(
      fixRelaxedJsonInLpLogEntry(
        lpLogEntry.substring(lpInitializationLogEntryInfoStart)
      )
    );
  }

  async fixRelaxedJsonInLpLogEntry(relaxedJson) {
    return relaxedJson.replace(
      /([{,])\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g,
      '$1"$2":'
    );
  }
  async parsePoolInfoFromLpTransaction(txData) {
    const initInstruction = await this.findInstructionByProgramId(
      txData.transaction.message.instructions,
      new PublicKey(RAYDIUM_POOL_V4_PROGRAM_ID)
    );
    if (!initInstruction) {
      throw new Error("Failed to find lp init instruction in lp init tx");
    }
    const baseMint = initInstruction.accounts[8];
    const baseVault = initInstruction.accounts[10];
    const quoteMint = initInstruction.accounts[9];
    const quoteVault = initInstruction.accounts[11];
    const lpMint = initInstruction.accounts[7];
    const pumpFun_Migrate = initInstruction.accounts[17];
    const baseAndQuoteSwapped = baseMint.toBase58() === SOL;
    const baseTransferInstruction =
      await this.findTransferInstructionInInnerInstructionsByDestination(
        txData.meta?.innerInstructions ?? [],
        baseVault,
        TOKEN_PROGRAM_ID
      );
    if (!baseTransferInstruction) {
      throw new Error("Failed to find base transfer instruction in lp init tx");
    }
    const quoteTransferInstruction =
      await this.findTransferInstructionInInnerInstructionsByDestination(
        txData.meta?.innerInstructions ?? [],
        quoteVault,
        TOKEN_PROGRAM_ID
      );
    if (!quoteTransferInstruction) {
      throw new Error(
        "Failed to find quote transfer instruction in lp init tx"
      );
    }
    const basePreBalance = (txData.meta?.preTokenBalances ?? []).find(
      (balance) => balance.mint === baseMint.toBase58()
    );
    if (!basePreBalance) {
      throw new Error(
        "Failed to find base tokens preTokenBalance entry to parse the base tokens decimals"
      );
    }
    const baseDecimals = basePreBalance.uiTokenAmount.decimals;

    return {
      id: initInstruction.accounts[4],
      baseMint,
      quoteMint,
      // lpMint,
      baseDecimals: baseAndQuoteSwapped ? SOL_DECIMALS : baseDecimals,
      quoteDecimals: baseAndQuoteSwapped ? baseDecimals : SOL_DECIMALS,
      programId: new PublicKey(RAYDIUM_POOL_V4_PROGRAM_ID),
      openOrders: initInstruction.accounts[6],
      targetOrders: initInstruction.accounts[13],
      baseVault,
      quoteVault,
      marketId: initInstruction.accounts[16],
      pumpFun_Migrate,
      baseReserve: parseInt(baseTransferInstruction.parsed.info.amount),
      quoteReserve: parseInt(quoteTransferInstruction.parsed.info.amount),
    };
  }

  async fetchMarketInfo(marketId) {
    const marketAccountInfo = await this.connection.getAccountInfo(marketId);
    if (!marketAccountInfo) {
      throw new Error(
        "Failed to fetch market info for market id " + marketId.toBase58()
      );
    }

    return MARKET_STATE_LAYOUT_V3.decode(marketAccountInfo.data);
  }

  async fetchPoolKeysForLPInitTransactionHash(txSignature) {
    const tx = await this.connection.getParsedTransaction(txSignature, {
      maxSupportedTransactionVersion: 0,
    });
    if (!tx) {
      throw new Error(
        "Failed to fetch transaction with signature " + txSignature
      );
    }
    const poolInfo = await this.parsePoolInfoFromLpTransaction(tx);
    // console.log("poolInfo: ", poolInfo);

    const marketInfo = await this.fetchMarketInfo(poolInfo.marketId);
    // console.log("marketInfo:   ", marketInfo);

    console.log(
      "poolInfo.pumpFun_Migrate.toString(): ",
      poolInfo.pumpFun_Migrate.toString()
    );

    console.log(
      "PUMPFUN_RAYDIUM_MIGRATIOM.toString():   ",
      PUMPFUN_RAYDIUM_MIGRATIOM.toString()
    );

    return {
      id: poolInfo.id.toBase58(),
      baseMint: poolInfo.baseMint.toBase58(),
      quoteMint: poolInfo.quoteMint.toBase58(),
      programId: poolInfo.programId.toBase58(),
      baseReserve: poolInfo.baseReserve,
      quoteReserve: poolInfo.quoteReserve,
      baseDecimals: poolInfo.baseDecimals,
      quoteDecimals: poolInfo.quoteDecimals,
      openOrders: poolInfo.openOrders.toBase58(),
      targetOrders: poolInfo.targetOrders.toBase58(),
      baseVault: poolInfo.baseVault.toBase58(),
      quoteVault: poolInfo.quoteVault.toBase58(),
      marketId: poolInfo.marketId.toBase58(),
      pumpFun_Raydium_Migrate:
        poolInfo.pumpFun_Migrate.toString() ===
        PUMPFUN_RAYDIUM_MIGRATIOM.toString(),
      marketBaseVault: marketInfo.baseVault.toBase58(),
      marketQuoteVault: marketInfo.quoteVault.toBase58(),
      marketBids: marketInfo.bids.toBase58(),
      marketAsks: marketInfo.asks.toBase58(),
      marketEventQueue: marketInfo.eventQueue.toBase58(),
    };
  }

  async worker(job) {
    try {
      console.log("=========>>>newRaydiumPoolWorker<<<===========");
      const { data } = job.data;

      console.log("Data:  ", data.signature);
      const poolKeys = await this.fetchPoolKeysForLPInitTransactionHash(
        data.signature
      ); // With poolKeys you can do a swap+

      if (poolKeys?.quoteMint == SOL || poolKeys?.baseMint == SOL) {
        const liquidity = await this.raydiumAmmService.getLiquidity(
          poolKeys.baseMint,
          poolKeys.quoteMint,
          poolKeys.baseVault,
          poolKeys.quoteVault
        );
        const newRaydiumPool = new raydiumNewPoolModel({
          poolId: poolKeys?.id,
          liquidity,
          programId: poolKeys?.programId,
          baseMint: poolKeys?.baseMint,
          quoteMint: poolKeys?.quoteMint,
          baseReserve: poolKeys?.baseReserve,
          quoteReserve: poolKeys?.quoteReserve,
          signature: data?.signature,
          baseVault: poolKeys?.baseVault,
          quoteVault: poolKeys?.quoteVault,
          marketId: poolKeys?.marketId,
          pumpFun_Raydium_Migrated: poolKeys?.pumpFun_Raydium_Migrate,
          marketBaseVault: poolKeys?.marketBaseVault,
          marketQuoteVault: poolKeys?.marketQuoteVault,
          marketBids: poolKeys?.marketBids,
          marketAsks: poolKeys?.marketAsks,
          marketEventQueue: poolKeys?.marketEventQueue,
        });
        await newRaydiumPool.save().then(async () => {
          logger.info("New raydium pool added");
        });

        await addTokenForAutoBuy(newRaydiumPool);
      }
    } catch (error) {
      console.log(
        "🚀 ~ worker ~ error inside new raydiumNewPool worker:",
        error
      );
    }
  }
}

module.exports = new NewRaydiumPoolWorker();
