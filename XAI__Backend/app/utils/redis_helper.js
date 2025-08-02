const logger = require("log4js").getLogger("redis_helper_service");
const Redis = require("ioredis");
const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = require("../../configs/env");

class RedisHelper {
  constructor() {
    this.client = new Redis({
      host: REDIS_HOST,
      port: REDIS_PORT,
      password: REDIS_PASSWORD,
    });
    

    this.client.on("ready", () => {
      logger.info("redis is ready");
    });

    this.client.on("connect", () => {
      logger.info("redis connection established");
    });

    this.client.on("reconnecting", () => {
      logger.info("redis reconnecting");
    });

    this.client.on("error", (error) => {
      logger.error("redis error occured", error);
    });

    this.client.on("end", () => {
      logger.error("redis connection ended");
    });
  }

  getClient() {
    return this.client;
  }
}

module.exports = RedisHelper;
