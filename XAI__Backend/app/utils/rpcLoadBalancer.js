const { RPC_ENDPOINTS } = require("../../configs/env");
const Bottleneck = require("bottleneck");
const RPC_URLS = RPC_ENDPOINTS.split(",");
const MAX_REQUESTS_PER_SECOND = 50;
const RPC_COUNT = RPC_URLS.length;

const limiters = RPC_URLS.map(
  () =>
    new Bottleneck({
      minTime: 1000 / MAX_REQUESTS_PER_SECOND,
      maxConcurrent: 1,
    })
);



let rpcIndex = 0;

function getNextRPC() {
  const rpcUrl = RPC_URLS[rpcIndex];
  const limiter = limiters[rpcIndex];
  rpcIndex = (rpcIndex + 1) % RPC_COUNT; // Move to the next RPC
  return { rpcUrl, limiter };
}

module.exports = {
  getNextRPC,
};
