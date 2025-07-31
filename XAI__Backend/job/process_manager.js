const QueueHelper = require("./utils/queue.helper");
const raydiumNewPoolQ = QueueHelper.getQueueInstance("raydiumNewPoolQ");
const autoBuyQ = QueueHelper.getQueueInstance("autoBuyQ");
const autoSellQ = QueueHelper.getQueueInstance("autoSellQ");
const matchTokenPropertiesQ = QueueHelper.getQueueInstance(
  "matchTokenPropertiesQ"
);
const tokenFinalSellQ = QueueHelper.getQueueInstance("tokenFinalSellQ");
const reEntrySellQ = QueueHelper.getQueueInstance("reEntrySellQ");
module.exports = {
  raydiumNewPoolQ,
  autoBuyQ,
  autoSellQ,
  matchTokenPropertiesQ,
  tokenFinalSellQ,
  reEntrySellQ,
};
