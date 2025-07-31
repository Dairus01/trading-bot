const logger = require("log4js").getLogger("redis-services");
const RedisService = require("../utils/redis.service");
const cron = require("node-cron");
const redisService = new RedisService();
const axios = require("axios");
module.exports = () => {
  cron.schedule("*/30 * * * * *", async () => {
    try {
      console.log("running a task every 30 seconds to get sol to usdc rate");
      const solToUsdcRate = await redisService.fetchSolToUsdcRate();
      if (solToUsdcRate) {
        await redisService.setCache("solToUsdcRate", solToUsdcRate);
      }
    } catch (error) {
      logger.error("Error in scheduled task:", error.message);
    }
  });
};
