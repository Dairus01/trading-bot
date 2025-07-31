const {
  Connection,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} = require("@solana/web3.js");
const { SOL_RPC } = require("../../configs/env");

class Sendtransaction {
  constructor() {
    this.connection = new Connection(SOL_RPC, {
      commitment: "confirmed",
    });
  }

  async fetchTransactionDetails(
    connection,
    signature,
    retries = 5,
    delay = 10000
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

  async processRaydiumSingleTransaction(
    transaction,
    payer,
    addressLookupTables,
    owner
  ) {
    try {
      const { blockhash, lastValidBlockHeight } =
        await this.connection.getLatestBlockhash();
      const messageV0 = new TransactionMessage({
        payerKey: payer ? payer.publicKey : new PublicKey(owner),
        recentBlockhash: blockhash,
        instructions: transaction,
      }).compileToV0Message(addressLookupTables);

      const Transaction = new VersionedTransaction(messageV0);
      if (payer) {
        Transaction.sign([payer]);
      }
      // const txId =
      //   "n9nFRPVFmCWFdyPDFsiJcCJzncnYdwGQXfw3BbJBoyFeQ9TERoX78vRFtiT4jk9DuZsjbkDRKvCzRJajSsEkooT";
      const txId = await this.connection.sendRawTransaction(
        Transaction.serialize()
      );

      console.log("txId:::::::::: **********8111111111111111111111:  ", txId);

      await this.connection.confirmTransaction(
        {
          blockhash,
          lastValidBlockHeight,
          signature: txId,
        },
        "finalized"
      );
      let signature = txId;

      console.log("************* signature 2222222222222222222:   ", signature);
      const transactionDetails = await this.fetchTransactionDetails(
        this.connection,
        signature
      );

      console.log("signature: 3333333333333333333333333333  ", signature);

      if (!transactionDetails) {
        console.error("Transaction details could not be retrieved.");
        return { signature, isSuccess: false };
      } else {
        console.log(`✅ Transaction details retrieved successfully.`);
        const isSuccess = transactionDetails.meta.err === null;
        return { signature, isSuccess };
      }
    } catch (error) {
      console.error(`❌ Error processing transaction:`, error);
      return { signature: null, isSuccess: false };
    }
  }
}

module.exports = Sendtransaction;
