const nacl = require("tweetnacl");
const bs58 = require("bs58");
const { MESSAGE } = require("../../configs/env.js");
const {
  Connection,
  PublicKey,
  Keypair,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
} = require("@solana/web3.js"); // Import Solana web3.js
const { getMint } = require("@solana/spl-token"); // Import SPL Token package
const { SOL_RPC } = require("../../configs/env.js");
const axios = require("axios");
const { getNextRPC } = require("../utils/rpcLoadBalancer.js");
console.log("solana web3", getNextRPC().rpcUrl);

class SolanWeb3Helper {
  constructor() {
    this.message = MESSAGE;
    this.connection = new Connection(getNextRPC().rpcUrl, {
      commitment: "confirmed",
    });
  }

  async getBalance(publicKey) {
    const balance = await this.connection.getBalance(new PublicKey(publicKey));
    return balance;
  }
  async convertStringToPublicKey(programId) {
    return new PublicKey(programId);
  }

  verfiyPublicAddressForSignature(publicKey, signature) {
    const verified = nacl.sign.detached.verify(
      new TextEncoder().encode(this.message),
      bs58.decode(signature),
      bs58.decode(publicKey)
    );
    return verified;
  }

  async getTokenDecimal(tokenMintAddress) {
    const tokenMintAddr = new PublicKey(tokenMintAddress);
    const mintInfo = await getMint(this.connection, tokenMintAddr);
    // console.log("mintInfo: ", mintInfo);
    const currentSupply = Number(mintInfo.supply);
    return { supply: currentSupply, decimals: mintInfo.decimals };
  }

  async getTokenValuesInSol(
    buyAmount,
    adjustedAmount,
    slippage,
    gas_priority_fee,
    tokenMintAddress
  ) {
    const { decimals } = await this.getTokenDecimal(tokenMintAddress);
    const tokenAmountInSol = Number(buyAmount) / Math.pow(10, decimals);
    const solAmountInSol = Number(adjustedAmount) / Math.pow(10, 9);
    const slippageInSol = Number(slippage) / Math.pow(10, 2);
    const gas_priority_feeInSol = Number(gas_priority_fee) / Math.pow(10, 9);
    return {
      tokenAmountInSol,
      solAmountInSol,
      slippageInSol,
      gas_priority_feeInSol,
    };
  }

  async depositHelper(amount, sender, receiver) {
    const senderPublicKey = new PublicKey(sender);
    const receiverPublicKey = new PublicKey(receiver);
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: senderPublicKey,
        toPubkey: receiverPublicKey,
        lamports: amount * LAMPORTS_PER_SOL, // Sending 0.1 SOL
      })
    );

    transaction.feePayer = senderPublicKey;
    transaction.recentBlockhash = (
      await this.connection.getLatestBlockhash()
    ).blockhash;
    return Buffer.from(
      transaction.serialize({ requireAllSignatures: false })
    ).toString("base64");
  }

  async withdrawHelper(amount, sender, receiver, privateKey) {
    const payer = Keypair.fromSecretKey(bs58.decode(privateKey));
    const senderPublicKey = new PublicKey(sender);
    const receiverPublicKey = new PublicKey(receiver);
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: senderPublicKey,
        toPubkey: receiverPublicKey,
        lamports: amount * LAMPORTS_PER_SOL, // Sending 0.1 SOL
      })
    );

    const result = await this.processSingleTransaction(transaction, payer);
    return result;
  }

  async processSingleTransaction(transaction, payer) {
    let isSuccess = false;
    let signature;

    try {
      // Ensure transaction has a valid recentBlockhash
      if (!transaction.recentBlockhash) {
        console.log("Fetching latest blockhash...");
        const latestBlockhash = await this.connection.getLatestBlockhash();
        transaction.recentBlockhash = latestBlockhash.blockhash;
      }

      signature = await this.sendTransactionWithRetry(
        this.connection,
        transaction,
        payer
      );

      //signature = "2dwxspK9QD9fd9BbEDEREfnXD7SzwwrZBPUHZfKcesKdvy79MXZUCda7PrStNRNxsAMenvAvMAqaL2MnVhi35Faq"
      console.log(`✅ Transaction details retrieved successfully.`);
      const transactionDetails = await this.fetchTransactionDetails(
        this.connection,
        signature
      );

      if (!transactionDetails) {
        console.error("Transaction details could not be retrieved.");
        return { signature, isSuccess: false };
      }

      console.log(`✅ Transaction details retrieved successfully.`);
      isSuccess = transactionDetails.meta.err === null;
    } catch (error) {
      this.handleTransactionError(error);
      return { signature: null, isSuccess: false };
    }

    return { signature, isSuccess };
  }

  async sendTransactionWithRetry(connection, transaction, payer) {
    try {
      return await sendAndConfirmTransaction(connection, transaction, [payer]);
    } catch (error) {
      console.error(`❌ Error processing transaction:`, error);
      if (error.message.includes("block height exceeded")) {
        console.log(
          "⚠️ Transaction expired. Retrying with a fresh blockhash..."
        );
        const newBlockhash = await connection.getLatestBlockhash();
        transaction.recentBlockhash = newBlockhash.blockhash;
        return await sendAndConfirmTransaction(connection, transaction, [
          payer,
        ]);
      }
      throw error;
    }
  }

  async fetchTransactionDetails(
    connection,
    signature,
    retries = 5,
    delay = 2000
  ) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      console.log(
        `🔍 Fetching transaction details (Attempt ${attempt}/${retries})...`
      );
      const transaction = await connection.getTransaction(signature, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
      });

      if (transaction?.meta) {
        return transaction;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    console.error(
      `❌ Transaction details are not available after ${retries} retries for signature: ${signature}`
    );
    return null;
  }

  handleTransactionError(error) {
    console.error(`Error processing transaction:`);
    if (error.logs) {
      const slippageError = error.logs.find((log) =>
        log.includes("TooLittleSolReceived")
      );
      if (slippageError) {
        console.error(
          "❌ Slippage error: Too little SOL received to sell the given amount of tokens."
        );
        console.error(
          "💡 Tip: Consider adjusting the slippage tolerance or trying a smaller amount."
        );
      } else {
        console.error(
          "❌ An unexpected error occurred during the transaction."
        );
      }
    } else {
      console.error(
        "❌ An unexpected error occurred and no logs are available."
      );
    }
  }
}
module.exports = SolanWeb3Helper;
