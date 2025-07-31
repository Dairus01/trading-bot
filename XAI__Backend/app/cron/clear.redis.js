// const logger = require("log4js").getLogger("redis-services");
// const RedisService = require("../utils/redis.service");
// const cron = require("node-cron");
// const redisService = new RedisService();
// module.exports = () => {
//   cron.schedule("0 */12 * * *", async () => {
//     try {
//       logger.info("Running scheduled task to clear Redis cache.");
//       await redisService.clearCache();
//       logger.info("Scheduled Redis cache clearing completed.");
//     } catch (error) {
//       logger.error(
//         "Error during scheduled Redis cache clearing:",
//         error.message
//       );
//     }
//   });
// };
