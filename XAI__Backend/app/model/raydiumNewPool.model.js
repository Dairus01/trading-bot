const mongoose = require("mongoose");
const { Schema } = mongoose;
const raydiumNewPoolSchema = new Schema(
  {
    poolId: {
      type: Schema.Types.String,
    },
    liquidity: {
      type: Schema.Types.Number,
    },
    baseMint: {
      type: Schema.Types.String,
    },
    quoteMint: {
      type: Schema.Types.String,
    },
    baseReserve: {
      type: Schema.Types.Number,
    },
    quoteReserve: {
      type: Schema.Types.Number,
    },
    signature: {
      type: Schema.Types.String,
    },
    programId: {
      type: Schema.Types.String,
    },
    baseVault: {
      type: Schema.Types.String,
    },
    quoteVault: {
      type: Schema.Types.String,
    },
    marketId: {
      type: Schema.Types.String,
    },
    pumpFun_Raydium_Migrated: {
      type: Schema.Types.Boolean,
    },
    marketBaseVault: {
      type: Schema.Types.String,
    },
    marketQuoteVault: {
      type: Schema.Types.String,
    },
    marketBids: {
      type: Schema.Types.String,
    },

    marketAsks: {
      type: Schema.Types.String,
    },
  },
  {
    timestamps: true,
  }
);

const raydiumNewPoolModel = mongoose.model(
  "raydiumNewPool",
  raydiumNewPoolSchema
);
module.exports = raydiumNewPoolModel;
