const mongoose = require("mongoose");
const { Schema } = mongoose;
const scrappedTokenSchema = new Schema(
  {
    tokenAddress: {
      type: Schema.Types.String,
    },
    poolId: {
      type: Schema.Types.String,
    },
    status: {
      type: Schema.Types.String,
    },
    platform: {
      type: Schema.Types.String,
    },
  },
  {
    timestamps: true,
  }
);

const scrappedTokenModel = mongoose.model(
  "scrappedTokenModel",
  scrappedTokenSchema
);
module.exports = scrappedTokenModel;
