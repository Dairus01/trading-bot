const logger = require("log4js").getLogger("raydium_helper");
const { HttpException } = require("../error/HttpException");
const errorType = require("../error/errorcodes");
const { LIQUIDITY_STATE_LAYOUT_V4 } = require("@raydium-io/raydium-sdk");
const {
  Raydium,
  DEVNET_PROGRAM_ID,
  AMM_V4,
  AMM_STABLE,
  TxVersion,
  AmmPool,
} = require("@raydium-io/raydium-sdk-v2");
const { PublicKey, Connection, Keypair } = require("@solana/web3.js");
const bs58 = require("bs58");
const {
  getAssociatedTokenAddressSync,
} = require("@raydium-io/raydium-sdk/node_modules/@solana/spl-token");
const BN = require("bn.js");
const {
  SOL_RPC,
  RAYDIUM_POOL_V4_PROGRAM_ID,
  SOL,
} = require("../../configs/env.js");
const raydiumNewPoolModel = require("../../app/model/raydiumNewPool.model");
const cryptography = require("../utils/cryptography.js");
const SolanWeb3Helper = require("../utils/solanaWeb3.helper.js");
const Sendtransaction = require("./signAndSendTransaction.js");
const {
  TRADE_TYPE,
  TRADE_STATUS,
  TRADE_FROM,
} = require("../utils/enum_helper.js");
const transactionModel = require("../model/transcation.model.js");
const purchaseModel = require("../model/purchase.model.js");
const UserModel = require("../model/user.model.js");
const RedisService = require("../utils/redis.service.js");
const { getNextRPC } = require("../utils/rpcLoadBalancer.js");
console.log("Get Next Rpcssss", getNextRPC().rpcUrl);
class RaydiumAmmServiceV2 {
  constructor() {
    this.connection = new Connection(getNextRPC().rpcUrl, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });

    // this.connection = Connections
    this.web3Service = new SolanWeb3Helper();
    this.sendtransaction = new Sendtransaction();
    this.redisService = new RedisService();
  }

  async processBatch(mints, tokenData) {
    try {
      // Batch fetch prices
      const prices = await raydiumSDK.fetchMultiplePoolPrices(mints);
    } catch (error) {
      console.error("Batch processing failed:", error);
    }
  }

  async getLiquidity(baseMint, quoteMint, baseVault, quoteVault) {
    let tokenAddress;
    let solAddress;
    let tokenVault;
    let solVault;
    if (baseMint === SOL) {
      solAddress = baseMint;
      tokenAddress = quoteMint;
      solVault = baseVault;
      tokenVault = quoteVault;
    } else {
      solVault = quoteVault;
      tokenVault = baseVault;
      solAddress = quoteMint;
      tokenAddress = baseMint;
    }
    // Fetch token balances
    const solTokenBalance = await this.connection.getTokenAccountBalance(
      new PublicKey(solVault)
    );
    const tokenBalance = await this.connection.getTokenAccountBalance(
      new PublicKey(tokenVault)
    );

    const solAmount = parseFloat(solTokenBalance.value.uiAmount);
    const tokenAmount = parseFloat(tokenBalance.value.uiAmount);

    // Fetch SOL to USDC conversion rate from cache
    const solToUsdcRate = parseFloat(
      await this.redisService.getCache("solToUsdcRate")
    );
    // Compute token price in USDC
    const tokenPriceInUsdc = (solAmount / tokenAmount) * solToUsdcRate;
    // Calculate liquidity and fix precision to 11 decimal places
    const liquidity = (
      tokenAmount * tokenPriceInUsdc +
      solAmount * solToUsdcRate
    ).toFixed(11);
    return parseFloat(liquidity); // Returning as a number instead of a string
  }

  async getPoolInfo(payer, poolId) {
    const raydium = await this.getRaydium(payer);
    const data = await raydium.liquidity.getPoolInfoFromRpc({ poolId });
    return data.poolRpcData.lpMint;
  }

  async getRaydium(payer, input = undefined) {
    const { rpcUrl, limiter } = getNextRPC();

    console.log("get Raydium connection", rpcUrl);

    const connection = new Connection(rpcUrl);

    return limiter.schedule(async () => {
      const raydium = await Raydium.load({
        owner: payer,
        connection: connection,
        cluster: "mainnet",
        disableFeatureCheck: true,
        disableLoadToken: !input?.loadToken,
        blockhashCommitment: "finalized",
      });
      return raydium;
    });
  }

  async getTokenPriceLiquidityMarketCap(tokenAddress, secretKey) {
    try {
      let fromMint = "So11111111111111111111111111111111111111112";
      let toMint = tokenAddress;
      const secretkey = await cryptography.decrypt(secretKey);
      const payer = Keypair.fromSecretKey(bs58.decode(secretkey));

      const amount = 1000000000;
      const raydium = await this.getRaydium(payer);

      let raydiumData = await raydiumNewPoolModel.findOne({
        $or: [
          { quoteMint: fromMint, baseMint: toMint },
          { quoteMint: toMint, baseMint: fromMint },
        ],
      });

      let pool = raydiumData?.poolId;
      if (!raydiumData) {
        pool = await this.findPoolAddressForMintAddress(fromMint, toMint);
        if (!pool) {
          pool = await this.findPoolAddressForMintAddress(toMint, fromMint);
        }
        console.log("pool: ", pool);
      }

      let poolInfo;
      const poolId = pool;
      const inputMint = fromMint;
      let poolKeys;
      let rpcData;
      let inputAmount = new BN(amount);
      if (raydium.cluster === "mainnet") {
        const data = await raydium.liquidity.getPoolInfoFromRpc({ poolId });
        poolInfo = data.poolInfo;
        poolKeys = data.poolKeys;
        rpcData = data.poolRpcData;

        if (!(await this.isValidClmm(poolInfo?.programId))) {
          throw new Error("target pool is not AMM pool");
        }
        poolKeys = await raydium.liquidity.getAmmPoolKeys(poolId);
        rpcData = await raydium.liquidity.getRpcPoolInfo(poolId);
      } else {
        const data = await raydium.liquidity.getPoolInfoFromRpc({ poolId });
        poolInfo = data.poolInfo;
        poolKeys = data.poolKeys;
        rpcData = data.poolRpcData;
      }

      const [baseReserve, quoteReserve, status] = [
        rpcData.baseReserve,
        rpcData.quoteReserve,
        rpcData.status.toNumber(),
      ];
      if (
        poolInfo.mintA.address !== inputMint &&
        poolInfo.mintB.address !== inputMint
      ) {
        throw new Error("input mint does not match pool");
      }

      const baseIn = inputMint === poolInfo.mintA.address;
      const [mintIn, mintOut] = baseIn
        ? [poolInfo.mintA, poolInfo.mintB]
        : [poolInfo.mintB, poolInfo.mintA];
      const out = raydium.liquidity.computeAmountOut({
        poolInfo: {
          ...poolInfo,
          baseReserve,
          quoteReserve,
          status,
          version: 4,
        },
        amountIn: inputAmount,
        mintIn: mintIn.address,
        mintOut: mintOut.address,
        slippage: 0, // range: 1 ~ 0.0001, means 100% ~ 0.01%
      });

      let tokenReserve = 0;
      let solReserve = 0;
      const solDecimals = mintIn.decimals;
      const tokenDecimals = mintOut.decimals;
      if (baseIn) {
        solReserve = baseReserve.toString();
        tokenReserve = quoteReserve.toString();
      } else {
        tokenReserve = baseReserve.toString();
        solReserve = quoteReserve.toString();
      }

      const solToUsdc = await this.redisService.getCache("solToUsdcRate");

      const tokenPriceInSol = Number(1 / out.executionPrice.toNumber());

      const tokenPriceInUsdc = Number(tokenPriceInSol * solToUsdc);

      const currentTokenPrice = Number(1 / out.currentPrice.toNumber());

      // const marketCap = Number(currentTokenPrice * 1000000000 * solToUsdc);
      const liquidity =
        (tokenReserve / 10 ** tokenDecimals) * currentTokenPrice * solToUsdc +
        (solReserve / 10 ** solDecimals) * solToUsdc;

      return {
        tokenPriceInSol,
        tokenPriceInUsdc,
        // marketCap,
        liquidity,
      };
    } catch (err) {
      console.log("erro to get token price,liquidity and market cap", err);
    }
  }
  async findPoolAddressForMintAddress(mintA, mintB) {
    try {
      const accounts = await this.connection.getProgramAccounts(
        new PublicKey(RAYDIUM_POOL_V4_PROGRAM_ID),
        {
          commitment: "confirmed",
          filters: [
            { dataSize: LIQUIDITY_STATE_LAYOUT_V4.span },
            {
              memcmp: {
                offset: LIQUIDITY_STATE_LAYOUT_V4.offsetOf("baseMint"),
                bytes: mintA,
              },
            },
            {
              memcmp: {
                offset: LIQUIDITY_STATE_LAYOUT_V4.offsetOf("quoteMint"),
                bytes: mintB,
              },
            },
          ],
        }
      );
      // console.log("accounts: ", accounts);
      return accounts.length > 0 ? accounts[0].pubkey.toString() : null;
    } catch (error) {
      console.error("Failed to find pool address:", error);
      return null;
    }
  }

  async isValidClmm(id) {
    const VALID_PROGRAM_ID = new Set([
      AMM_V4.toBase58(),
      AMM_STABLE.toBase58(),
      DEVNET_PROGRAM_ID.AmmV4.toBase58(),
      DEVNET_PROGRAM_ID.AmmStable.toBase58(),
    ]);
    return VALID_PROGRAM_ID.has(id);
  }

  async getQuote(input) {
    try {
      let { fromMint, toMint, amount, slippage, secretKey } = input;
      // Add detailed logging for debugging base58 errors
      console.log('getQuote input:', input);
      console.log('Attempting to decrypt and decode secretKey:', secretKey);
      let secretkey, payer;
      try {
        secretkey = await cryptography.decrypt(secretKey);
        console.log('Decrypted secretKey:', secretkey);
        payer = Keypair.fromSecretKey(bs58.decode(secretkey));
      } catch (decodeError) {
        console.error('Error decoding secretKey with bs58:', secretkey, decodeError);
        throw decodeError;
      }
      const raydium = await this.getRaydium(payer, input);
      let raydiumData = await raydiumNewPoolModel.findOne({
        $or: [
          { quoteMint: fromMint, baseMint: toMint }, // Pair 1: fromMint -> fromMint, toMint -> toMint
          { quoteMint: toMint, baseMint: fromMint }, // Pair 2: fromMint -> toMint, toMint -> fromMint
        ],
      });
      let pool = raydiumData?.poolId;
      if (!raydiumData) {
        pool = await this.findPoolAddressForMintAddress(fromMint, toMint);

        if (!pool) {
          pool = await this.findPoolAddressForMintAddress(toMint, fromMint);
        }
      }

      let poolInfo;
      const poolId = pool;

      const inputMint = fromMint;
      let poolKeys;
      let rpcData;
      let inputAmount = new BN(amount);
      if (raydium.cluster === "mainnet") {
        const data = await raydium.liquidity.getPoolInfoFromRpc({ poolId });
        // const data = await raydium.api.fetchPoolById({ ids: poolId });
        poolInfo = data.poolInfo;
        poolKeys = data.poolKeys;
        rpcData = data.poolRpcData;

        if (!(await this.isValidClmm(poolInfo.programId))) {
          throw new Error("target pool is not AMM pool");
        }
        poolKeys = await raydium.liquidity.getAmmPoolKeys(poolId);
        rpcData = await raydium.liquidity.getRpcPoolInfo(poolId);
      } else {
        const data = await raydium.liquidity.getPoolInfoFromRpc({ poolId });
        poolInfo = data.poolInfo;
        poolKeys = data.poolKeys;
        rpcData = data.poolRpcData;
      }

      const [baseReserve, quoteReserve, status] = [
        rpcData.baseReserve,
        rpcData.quoteReserve,
        rpcData.status.toNumber(),
      ];
      if (
        poolInfo.mintA.address !== inputMint &&
        poolInfo.mintB.address !== inputMint
      ) {
        throw new Error("input mint does not match pool");
      }

      const baseIn = inputMint === poolInfo.mintA.address;
      const [mintIn, mintOut] = baseIn
        ? [poolInfo.mintA, poolInfo.mintB]
        : [poolInfo.mintB, poolInfo.mintA];
      const out = raydium.liquidity.computeAmountOut({
        poolInfo: {
          ...poolInfo,
          baseReserve,
          quoteReserve,
          status,
          version: 4,
        },
        amountIn: inputAmount,
        mintIn: mintIn.address,
        mintOut: mintOut.address,
        slippage: Number(slippage) ? Number(slippage) / 10000 : 0, // range: 1 ~ 0.0001, means 100% ~ 0.01%
      });

      console.log("inputAmount: ", inputAmount.toString());

      console.log(out);

      return {
        output: out,
        inputAmount,
        mintIn,
        mintOut,
        baseReserve,
        quoteReserve,
        status,
        raydium,
        poolInfo,
        poolKeys,
        payer,
      };
    } catch (error) {
      console.log(`Error to getting quote token in Raydium amm`, error);
      return { error: error?.message || 'Failed to get quote' };
    }
  }
  async getSwapTx({ input, autoBuyEnable, userId }) {
    let tokenAddress;
    let userBalance;
    let associatedUser;
    let userTokenBalance;
    try {
      const {
        fromMint,
        toMint,
        slippage,
        owner,
        amount,
        secretKey,
        gasPriorityFee,
        reEntryFlag,
      } = input;

      console.log("input: ", input);

      const marketToken = fromMint === SOL ? toMint : fromMint;
      tokenAddress = marketToken;
      const userAccount = new PublicKey(owner);
      userBalance = await this.connection.getBalance(userAccount);
      associatedUser = getAssociatedTokenAddressSync(
        new PublicKey(marketToken),
        new PublicKey(owner)
      );

      console.log("owner: ", owner);
      console.log("token address: ", marketToken);
      console.log("associatedUser: ", associatedUser);

      if (fromMint !== SOL) {
        userTokenBalance = await this.connection.getTokenAccountBalance(
          associatedUser
        );
        console.log(
          `📊 User's token balance (in decimal values): ${userTokenBalance.value.amount}`
        );
      }

      console.log(
        `📊 User's SOL balance (in lamports): ${userBalance} 
        \n after tx cost ${userBalance - 5000000}`
      );
      console.log(`User asking amount: ${amount}`);
      if (fromMint === SOL && userBalance - 5000000 < amount) {
        if (autoBuyEnable) {
          logger.log(`===============================================`);
          logger.log(`Insufficient fund in user wallet for auto buy`);
          logger.log(`============================================`);
          return { message: `insufficient fund in user wallet` };
        }
        logger.log(`================================================`);
        logger.log(`Insufficient fund in user wallet for manual buy`);
        logger.log(`===============================================`);
        throw new HttpException(
          errorType.INSUFFICIENT_FUND.status,
          errorType.INSUFFICIENT_FUND.message
        );
      } else if (
        fromMint !== SOL &&
        Number(userTokenBalance.value.amount) < Number(amount)
      ) {
        if (Number(userTokenBalance.value.amount) <= 0) {
          if (autoBuyEnable) {
            console.log(
              "Number(userTokenBalance.value.amount: ",
              Number(userTokenBalance.value.amount)
            );
            console.log("amount: ", Number(amount));
            logger.log(`===============================================`);
            logger.log(`Insufficient Toke in user wallet for auto Sell `);
            logger.log(`===============================================`);
            return { message: `insufficient fund in user wallet` };
          }
          logger.log(`===================================================`);
          logger.log(`Insufficient Tokken in user wallet for manual Sell`);
          logger.log(`===================================================`);
          throw new HttpException(
            errorType.INSUFFICIENT_TOKEN.status,
            errorType.INSUFFICIENT_TOKEN.message
          );
        } else {
          input.amount = Number(userTokenBalance.value.amount);
        }
      }
      const quote = await this.getQuote(input);
      if (!quote || quote.error || !quote.output) {
        return { isSuccess: false, error: quote?.error || 'Quote unavailable or invalid' };
      }
      let buyAmount = quote.output.amountOut.toString();

      console.log(
        "buyAmount ==================>>>>>>",
        quote.output.amountOut.toString()
      );
      console.log(
        "BuyAmountMin--------------------->>",
        quote.output.minAmountOut.toString()
      );
      let payer = quote.payer;
      const swapTnx = await this.handleSwapTransaction(quote, gasPriorityFee);
      let programInstructions = swapTnx.builder.allInstructions;
      let addressLookupTablesData =
        swapTnx.transaction.message.addressTableLookups;

      const addressLookupTablesAccount = await Promise.all(
        addressLookupTablesData.map(async (account) => {
          return (
            await this.connection.getAddressLookupTable(account.accountKey)
          ).value;
        })
      );

      let addressLookupTables = [...addressLookupTablesAccount];

      let instructions = [...programInstructions];
      const result = await this.sendtransaction.processRaydiumSingleTransaction(
        instructions,
        payer,
        addressLookupTables,
        owner
      );
      // buy condition for raydium

      let tokenAmount;
      let solAmount;
      if (input.fromMint === SOL) {
        solAmount = input.amount;
        tokenAmount = buyAmount;
      } else {
        //sell condition for raydium
        tokenAmount = input.amount;
        solAmount = buyAmount;
      }

      const {
        tokenAmountInSol,
        solAmountInSol,
        slippageInSol,
        gasPriorityFeeInSol,
      } = await this.web3Service.getTokenValuesInSol(
        tokenAmount,
        solAmount,
        slippage,
        gasPriorityFee,
        tokenAddress
      );

      let buyAmountInSol;
      if (input.fromMint === SOL) {
        input.amount = solAmountInSol;
        buyAmountInSol = tokenAmountInSol;
      } else {
        input.amount = tokenAmountInSol;
        buyAmountInSol = solAmountInSol;
      }

      input.slippage = slippageInSol;
      input.gasPriorityFee = gasPriorityFeeInSol;
      const data = await this.saveTransactionInDb(
        result,
        input,
        secretKey,
        autoBuyEnable,
        userId,
        buyAmountInSol,
        tokenAddress
      );
      return data;
    } catch (err) {
      console.log("error inside getSwapTx", err);
      return { isSuccess: false, error: err?.message || 'Swap transaction failed' };
    }
  }

  async handleSwapTransaction(quote, gasPriorityFee) {
    // console.log("queoeoeee",quote.output.minAmountOut,quote.inputAmount,quote.mintIn.address);
    // console.log(typeof(quote.inputAmount));
    //  console.log( typeof(quote.output.minAmountOut));
    //   console.log(typeof(quote.mintIn.address));
    return await quote.raydium.liquidity.swap({
      poolInfo: quote.poolInfo,
      poolKeys: quote.poolKeys,
      amountIn: quote.inputAmount,
      amountOut: quote.output.minAmountOut,
      fixedSide: "in",
      inputMint: quote.mintIn.address,
      txVersion: TxVersion.V0,
      computeBudgetConfig: {
        microLamports: gasPriorityFee,
      },
    });
  }

  async saveTransactionInDb(
    result,
    input,
    secretKey,
    autoBuyEnable,
    userId,
    buyAmount,
    tokenAddress
  ) {
    const {
      fromMint,
      toMint,
      amount,
      slippage,
      owner,
      gasPriorityFee,
      reEntryFlag,
    } = input;
    const updated_values = await this.getTokenPriceLiquidityMarketCap(
      tokenAddress,
      secretKey
    );
    let isSuccess = result?.isSuccess;
    let signatures = result?.signature;
    let tokenBalance = 0;
    const userAta = getAssociatedTokenAddressSync(
      new PublicKey(tokenAddress),
      new PublicKey(owner)
    );

    if (userAta) {
      try {
        tokenBalance = await this.connection.getTokenAccountBalance(userAta);
      } catch (err) {
        console.log("could not find account");
      }
    }
    if (fromMint === SOL) {
      console.log("Number(buyAmount): ", Number(buyAmount));
      console.log(
        "tokenBalance?.value?.uiAmount:  ",
        tokenBalance?.value?.uiAmount
      );
    }

    let newEntry = {
      userId,
      signature: signatures,
      trade_type: fromMint === SOL ? TRADE_TYPE.BUY : TRADE_TYPE.SELL,
      wallet_address: owner,
      in_amount: Number(buyAmount),
      out_amount: Number(amount),
      availableToken: tokenBalance?.value?.uiAmount || 0,
      status: isSuccess ? TRADE_STATUS.SUCCESS : TRADE_STATUS.FAIL, // Default to pending
      token_address: tokenAddress,
      slippage,
      gasPriorityFee,
      token_price: updated_values?.tokenPriceInUsdc,
      trade_from: autoBuyEnable ? TRADE_FROM.AUTO : TRADE_FROM.MANUAL,
      sold: false,
    };

    let transaction = await transactionModel.create(newEntry);
    await transaction.save();

    let purchase_details = await purchaseModel.findOne({
      token_address: tokenAddress,
      userId,
      trade_type: TRADE_TYPE.BUY,
    });

    let purchase_entry;
    if (!purchase_details) {
      if (isSuccess) {
        if (fromMint != SOL) {
          newEntry.reEntryFlag = reEntryFlag;
        }
        purchase_entry = await purchaseModel.create(newEntry);
        await purchase_entry.save();
        newEntry.priority = 5;
        newEntry.transactionId = purchase_entry._id;
        newEntry.timeStamp = new Date();
        newEntry.inTransit = false;
        await this.redisService.storeTokenInCaches(tokenAddress, newEntry);
        
        // Also store token configuration settings for stop loss tracking
        const user = await UserModel.findById(userId);
        if (user) {
          const cacheData = {
            transactionId: purchase_entry._id,
            userId: userId,
            stop_loss: user.stop_loss || [],
            take_profit: user.take_profit || [],
            minimumLiquidity: user.minimumLiquidity || 0,
            advancedStopLoss: user.advancedStopLoss || {},
            stopLossTracking: {
              buyPrice: updated_values?.tokenPriceInUsdc || 0,
              highestPrice: updated_values?.tokenPriceInUsdc || 0,
              reEntryCount: 0,
              stopLossTriggered: false,
              takeProfitTriggered: false,
              lastSellPrice: null,
            }
          };
          await this.redisService.setTokenConfigSettings(purchase_entry._id, cacheData);
        }
      }
    } else {
      if (isSuccess) {
        if (fromMint === SOL) {
          purchase_details.in_amount += Number(buyAmount); //<----------in buy case buyAmount is Token
          purchase_details.out_amount += Number(amount); //<----------in buy case amount is Sol
          purchase_details.reEntryFlag = reEntryFlag;
          purchase_details.availableToken = tokenBalance?.value?.uiAmount || 0;

          await purchase_details.save();
          newEntry.priority = 5;
          newEntry.transactionId = purchase_details._id;
          newEntry.timeStamp = new Date();
          newEntry.inTransit = false;
          await this.redisService.storeTokenInCaches(tokenAddress, newEntry);
          
          // Also store token configuration settings for stop loss tracking
          const user = await UserModel.findById(userId);
          if (user) {
            const cacheData = {
              transactionId: purchase_details._id,
              userId: userId,
              stop_loss: user.stop_loss || [],
              take_profit: user.take_profit || [],
              minimumLiquidity: user.minimumLiquidity || 0,
              advancedStopLoss: user.advancedStopLoss || {},
              stopLossTracking: {
                buyPrice: updated_values?.tokenPriceInUsdc || 0,
                highestPrice: updated_values?.tokenPriceInUsdc || 0,
                reEntryCount: 0,
                stopLossTriggered: false,
                takeProfitTriggered: false,
                lastSellPrice: null,
              }
            };
            await this.redisService.setTokenConfigSettings(purchase_details._id, cacheData);
          }
        } else {
          purchase_details.in_amount -= Number(amount); //<-----------in sell case amount is Token
          // purchase_details.out_amount += Number(buyAmount); //<---------in sell case buyAmount is Sol
          (purchase_details.availableToken =
            tokenBalance?.value?.uiAmount || 0),
            (purchase_details.sold = true);
          purchase_details.reEntryFlag = reEntryFlag;

          console.log(
            `\n\n*********** Re-Entry flag: ${reEntryFlag} ******************* \n\n`
          );
          purchase_details.token_price = updated_values.tokenPriceInUsdc;
          await purchase_details.save();
        }
      } else {
        if (fromMint !== SOL) {
          purchase_details.sold = false;
          await purchase_details.save();
        }
      }
    }

    console.log("Transaction saved in DB:  ", signatures);
    return {
      signature: signatures,
      isSuccess,
    };
  }
}

module.exports = RaydiumAmmServiceV2;
