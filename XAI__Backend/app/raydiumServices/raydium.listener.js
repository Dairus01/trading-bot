const logger = require("log4js").getLogger("raydium_new_pool_listener");
const { Connection, PublicKey } = require("@solana/web3.js");
const { SOL_RPC, RAYDIUM_FEE_ACCOUNT } = require("../../configs/env.js");
const { addRaydiumLogToGetPool } = require("../../job/add_task.js");
const MAX_SIZE = 10000;
const seenTransactions = new Set();
class RaydiumPoolListener {
  constructor() {
    this.connection = new Connection(SOL_RPC, {
      commitment: "confirmed",
    });
    this.listenNewPools();
  }

  listenNewPools() {
    this.connection.onLogs(
      new PublicKey(RAYDIUM_FEE_ACCOUNT),
      async (txLogs) => {
        if (seenTransactions.has(txLogs.signature)) {
          return;
        }
        if (seenTransactions.size >= MAX_SIZE) {
          const iterator = seenTransactions.values();
          for (let i = 0; i < 50; i++) {
            const transaction = iterator.next().value;
            if (transaction !== undefined) {
              seenTransactions.delete(transaction);
            }
          }
        }
        seenTransactions.add(txLogs.signature);
        console.log(
          "&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&"
        );
        await addRaydiumLogToGetPool(txLogs);
        logger.info("New raydium logs added into raydiumNewPoolQ");
      }
    );
    console.log("Listening to new pools.........");
  }
}

module.exports = new RaydiumPoolListener();
