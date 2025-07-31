/* eslint-disable max-len */
const logger = require("log4js").getLogger("add_task");
const {
  raydiumNewPoolQ,
  autoBuyQ,
  autoSellQ,
  matchTokenPropertiesQ,
  tokenFinalSellQ,
  reEntrySellQ,
} = require("./process_manager");

module.exports = {
  /* -------------------------------------- Raydium service ---------------------------------- */

  addRaydiumLogToGetPool: async (data) => {
    try {
      logger.info("Adding new raydium logs  into raydiumNewPoolQ to get pool");
      await raydiumNewPoolQ.add({ data });
      logger.info("New raydium logs added successfully");
    } catch (err) {
      logger.error(`error to adding token into raydiumNewPoolQ`, err.message);
    }
  },

  addTokenForAutoBuy: async (data) => {
    try {
      logger.info("Adding token for Buy ");
      await autoBuyQ.add(
        { data },
        {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 10000,
          },
        }
      );
      logger.info("Token added  for buy successfully");
    } catch (err) {
      logger.error(`error when auto Buy`, err.message);
    }
  },

  matchRaydiumTokenForSellWorker: async (data) => {
    try {
      logger.info(
        "Adding token for sell",
        Number(data.priority),
        typeof Number(data.priority)
      );
      await matchTokenPropertiesQ.add(data, {
        priority: Number(data.priority),
      });
      logger.info("Token added  for sell successfully");
    } catch (err) {
      logger.error(`error when auto sell`, err.message);
    }
  },

  addTokenForFinalSell: async (data) => {
    try {
      logger.info("adding token for final sell");
      await tokenFinalSellQ.add(data);
    } catch (err) {
      logger.error(`error when token final sell `, err.message);
    }
  },
  bullQueueSchedulers: async () => {
    try {
      logger.info("auto sell job scheduler  running successfully");
      await autoSellQ.add(
        {},
        {
          repeat: {
            every: 15000, // Every seconds in milliseconds
          },
        }
      );

      await reEntrySellQ.add(
        {},
        {
          repeat: {
            every: 50000,
          },
        }
      );
    } catch (err) {
      logger.error(`error when auto sell`, err.message);
    }
  },
};
