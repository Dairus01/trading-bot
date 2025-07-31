const Queue = require("bull");
const { createBullBoard } = require("@bull-board/api");
const { BullAdapter } = require("@bull-board/api/bullAdapter");
const { ExpressAdapter } = require("@bull-board/express");
const { REDIS_HOST, REDIS_PORT } = require("../../configs/env.js");

class QueueHelper {
  constructor() {
    this.serverAdapter = new ExpressAdapter();
    this.bullBoard = createBullBoard({
      queues: [],
      serverAdapter: this.serverAdapter,
    });
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
    this.bullBoard.removeQueue(new BullAdapter(queue_instance));
  }

  async addQueueToBullBoard(queue_instance) {
    this.bullBoard.addQueue(new BullAdapter(queue_instance));
  }
}

module.exports = new QueueHelper();
