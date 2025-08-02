const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "../configs/env/.env"),
});
module.exports = {
  SOL_RPC: process.env.SOL_RPC,
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 8100,
  MONGODB_URI:
    process.env.MONGODB_URI ||
    "mongodb://patricia_bot_mongo_db:27017/sniper_bot",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  JWT_SECRET: process.env.JWT_SECRET,
  saltRounds: process.env.saltRounds,
  MESSAGE: process.env.MESSAGE,
  walletAddress: process.env.walletAddress,
  withdrawWalletAddress: process.env.withdrawWalletAddress,
  SOL: process.env.SOL,
  RAYDIUM_FEE_ACCOUNT: process.env.RAYDIUM_FEE_ACCOUNT,
  RAYDIUM_POOL_V4_PROGRAM_ID: process.env.RAYDIUM_POOL_V4_PROGRAM_ID,
  RAYDIUM_AUTHORITY_V4: process.env.RAYDIUM_AUTHORITY_V4,

  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  PUMPFUN_RAYDIUM_MIGRATIOM: process.env.PUMPFUN_RAYDIUM_MIGRATIOM,
  SOLTOUSDC_URL: process.env.SOLTOUSDC_URL,
  BIRDEYE_BASE_URL: process.env.BIRDEYE_BASE_URL,
  BIRDEYE_API_KEY: process.env.BIRDEYE_API_KEY,
  numberOfWorker: process.env.numberOfWorker || 1,
  RPC_ENDPOINTS: process.env.RPC_ENDPOINTS,
  DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
  DISCORD_CHANNEL_ID: process.env.DISCORD_CHANNEL_ID,
  SOLTOUSDC_URL_COIN: process.env.SOLTOUSDC_URL_COIN,
};
