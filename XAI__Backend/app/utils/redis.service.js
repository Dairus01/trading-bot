const logger = require("log4js").getLogger("redis-services");
const RedisHelper = require("../utils/redis_helper");
const cron = require("node-cron");
const axios = require("axios");
const {
  SOLTOUSDC_URL,
  BIRDEYE_BASE_URL,
  BIRDEYE_API_KEY,
  SOL,
  SOLTOUSDC_URL_COIN,
} = require("../../configs/env.js");
class RedisService {
  constructor() {
    this.redisHelper = new RedisHelper();
  }

  async setCache(key, value) {
    try {
      await this.redisHelper.getClient().set(key, JSON.stringify(value));
      console.log(`Data cached with key: ${key}`);
    } catch (err) {
      console.error("Error setting cache:", err);
      return err;
    }
  }

  async fetchSolToUsdcRate() {
    try {
      const temp = await axios.get(SOLTOUSDC_URL_COIN);
      const solToUsdcRate = temp.data.solana.usd;
      console.log(
        "🚀 ~ RedisService ~ fetchSolToUsdcRate ~ !solToUsdcRate || typeof solToUsdcRa",
        !solToUsdcRate || typeof solToUsdcRate !== "number"
      );
      console.log(
        `**********  1 SOL equal to ${Number(solToUsdcRate).toFixed(
          2
        )} USDC **********`
      );
      return solToUsdcRate;
    } catch (error) {
      logger.error("Error fetching SOL/USDC rate:", error.message);
      return null;
    }
  }

  async getCache(key) {
    try {
      const data = await this.redisHelper.getClient().get(key);
      if (data) {
        logger.info("Cache hit");
        return JSON.parse(data);
      } else {
        logger.info("Cache miss");
        return null;
      }
    } catch (err) {
      logger.error("Error retrieving cache:", err);
      return null;
    }
  }

  async clearCache() {
    try {
      const client = this.redisHelper.getClient();
      await client.flushall(); // Clears all keys from the Redis store
      logger.info("Redis cache cleared successfully.");
    } catch (err) {
      logger.error("Error clearing cache:", err.message);
      return err;
    }
  }

  async storeTokenInCaches(tokenAddress, tokenData) {
    try {
      const key = `token:${tokenAddress}`;
      console.log("store token in redis ");
      await this.redisHelper.getClient().hset(key, tokenData);
      console.log("store token in caches successfully");
    } catch (err) {
      logger.error("Error storing token in Redis:", err);
      return null;
    }
  }

  async getTokenData(tokenAddress) {
    try {
      const key = `token:${tokenAddress}`;
      const client = this.redisHelper.getClient();

      // Check if the token exists
      const exists = await client.exists(key);
      if (!exists) {
        console.log(`Token ${tokenAddress} not found in Redis.`);
        return null;
      }
      const data = await this.redisHelper.getClient().hgetall(key);
      return data;
    } catch (error) {
      console.error("❌ Error updating token in Redis:", err);
      return null;
    }
  }

  async updateTokenInCache(tokenAddress, updatedFields) {
    try {
      const key = `token:${tokenAddress}`;
      const client = this.redisHelper.getClient();

      // Check if the token exists
      const exists = await client.exists(key);
      if (!exists) {
        console.log(`Token ${tokenAddress} not found in Redis.`);
        return false;
      }

      // Update specific fields in HSET
      for (const [field, value] of Object.entries(updatedFields)) {
        await client.hset(
          key,
          field,
          typeof value === "object" ? JSON.stringify(value) : value
        );
      }

      console.log(`✅ Token ${tokenAddress} updated successfully.`);
      return true;
    } catch (err) {
      console.error("❌ Error updating token in Redis:", err);
      return false;
    }
  }

  async setTokenConfigSettings(transactionId, tokenData) {
    try {
      const key = `perTokenSellSettings:${transactionId}`;

      const client = this.redisHelper.getClient();
      const exists = await client.exists(key);
      if (exists) {
        console.log(`Token config settings already exist for transactionId: ${transactionId}`);
        await client.del(key);
      }
      await this.redisHelper.getClient().set(key, JSON.stringify(tokenData));
    } catch (err) {
      logger.error("Error storing token in Redis:", err);
      return null;
    }
  }

  async getTokenFromCache(transactionId) {
    try {
      const key = `perTokenSellSettings:${transactionId}`;
      console.log("keyssssssssssssssssssssssssss");
      const data = await this.redisHelper.getClient().get(key);
      //return null;
      return JSON.parse(data);
    } catch (err) {
      logger.error("Error retrieving token from Redis:", err);
      return null;
    }
  }

  async storeUserSettingsInCaches(userId, userSettings) {
    try {
      const key = `userSettings:${userId} `;
      const client = this.redisHelper.getClient();
      const exists = await client.exists(key);
      if (exists) {
        console.log(`user ${userId} not found in Redis.`);
        await client.del(key);
      }
      await this.redisHelper.getClient().set(key, JSON.stringify(userSettings));
    } catch (err) {
      logger.error("Error storing user settings in Redis:", err);
      return null;
    }
  }

  async getUserSettingsFromCache(userId) {
    try {
      const key = `userSettings:${userId} `;
      const data = await this.redisHelper.getClient().get(key);
      return JSON.parse(data);
    } catch (err) {
      logger.error("Error retrieving user settings from Redis:", err);
      return null;
    }
  }

  async getAllTokenData() {
    try {
      const keys = await this.redisHelper.getClient().keys("token:*");
      if (!keys.length) {
        console.log("No tokens found.");
        return [];
      }
      let tokenDataArray = [];
      for (const key of keys) {
        const data = await this.redisHelper.getClient().hgetall(key);
        tokenDataArray.push(data);
      }
      return tokenDataArray;
    } catch (error) {
      console.error("Error retrieving token data:", error);
      return [];
    }
  }

  async removeSoldToken(tokenAddress) {
    try {
      const key = `token:${tokenAddress}`;
      const client = this.redisHelper.getClient();

      // Check if the token exists
      const exists = await client.exists(key);
      if (!exists) {
        console.log(`Token ${tokenAddress} not found in Redis.`);
        return;
      }

      // Delete the token from Redis
      await client.del(key);
      console.log(`Token ${tokenAddress} deleted from Redis.`);
    } catch (err) {
      console.error("Error deleting token from Redis:", err);
    }
  }
}
module.exports = RedisService;
