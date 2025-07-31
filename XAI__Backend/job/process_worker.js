const {
  raydiumNewPoolQ,
  autoBuyQ,
  autoSellQ,
  matchTokenPropertiesQ,
  tokenFinalSellQ,
  reEntrySellQ,
} = require("./process_manager");
const logger = require("log4js").getLogger("proccess-worker");
const newRaydiumPool = require("./worker/raydium.worker");
const tradeWorker = require("./worker/trade.worker");
const reEntryWorker = require("./worker/reEntry.worker");
const { numberOfWorker } = require("../configs/env");
console.log("numberofWorekr", numberOfWorker, typeof Number(numberOfWorker));

module.exports = {
  startWorkers: async () => {
    logger.info("Job Queue workers is being started...");
    raydiumNewPoolQ.process((job) => newRaydiumPool.worker(job));

    autoBuyQ.process((job) => tradeWorker.buyWorker(job));
    autoSellQ.process((job) => tradeWorker.sellWorker(job));
    reEntrySellQ.process((job) => reEntryWorker.reEntryWorker(job));
    matchTokenPropertiesQ.process(1, async (job) => {
      try {
        console.log(`👷 Processing job ${job.id} - Token:`);
        await tradeWorker.TokenPriceMonitorWorker(job.data);
        console.log(`✅ Job ${job.id} completed`);
      } catch (error) {
        console.error(`❌ Error processing job ${job.id}:`, error);
        throw error; // Allow Bull to retry the job if it fails
      }
    });

    tokenFinalSellQ.process(1, async (job) => {
      try {
        console.log(`👷 Processing  final sell job ${job.id} - Token:`);
        await tradeWorker.RaydiumTokenSellWorker(job);
        console.log(`✅ Job ${job.id} completed`);
      } catch (error) {
        console.error(`❌ Error processing job ${job.id}:`, error);
        throw error; // Allow Bull to retry the job if it fails
      }
    });
  },
};
