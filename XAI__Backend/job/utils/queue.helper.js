const Queue = require("bull");
const { REDIS_HOST, REDIS_PORT } = require("../../configs/env.js");

class QueueHelper {
  constructor() {
    // Disable Bull Board for Vercel deployment to avoid dependency issues
    this.serverAdapter = null;
    this.bullBoard = null;
  }

  getServerAdapter() {
    return this.serverAdapter;
  }

  getBullBoard() {
    return this.bullBoard;
  }

  getQueueNameForTokenCronJobs0x4b94A3361031c3839DB0F22E202C138f1BCCBC13(
    exchange,
    tokenAddress
  ) {
    return `${exchange}:${tokenAddress}`;
  }

  getQueueInstance(queue_name, limiterConfig = null) {
    const redisConnectOptions = {
      host: REDIS_HOST,
      port: REDIS_PORT,
    };

    const queueOptions = {
      redis: redisConnectOptions,
      // limiter: {
      //   max: 10,          // Maximum number of jobs to process
      //   duration: 30000,  // Time window in milliseconds (10 seconds)
      // },
    };
    if (limiterConfig) {
      queueOptions.limiter = limiterConfig;
    }
    const Q = new Queue(queue_name, queueOptions);

    //const Q = new Queue(queue_name, { redis: redisConnectOptions });
    this.addQueueToBullBoard(Q);
    return Q;
  }

  async deleteQueueInstance(queue_name) {
    const queue = this.getQueueInstance(queue_name);
    await queue.obliterate();
    this.deleteQueueFromBullBoard(queue);
    return true;
  }

  async deleteQueueFromBullBoard(queue_instance) {
    // Bull Board disabled for Vercel
    return true;
  }

  async addQueueToBullBoard(queue_instance) {
    // Bull Board disabled for Vercel
    return true;
  }
}

module.exports = new QueueHelper();
