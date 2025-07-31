const mongoose = require("mongoose");
const {
  TRADE_TYPE,
  TRADE_STATUS,
  TRADE_FROM,
} = require("../utils/enum_helper");
const tradeType = Object.values(TRADE_TYPE);
const trade_from = Object.values(TRADE_FROM);
const trade_status = Object.values(TRADE_STATUS);
const { Schema } = mongoose;

// Define schema for stop_loss and take_profit
const tradeConditionSchema = new Schema(
  {
    percentageLoss: { type: Number, min: 0, max: 100 }, // Percentage values (0-100)
    percentageProfit: { type: Number, min: 0, max: 100 }, // Profit condition (0-100)
    sellPercentage: { type: Number, min: 1, max: 100, required: true }, // Sell percentage (1-100)
  },
  { _id: false }
); // Disable automatic _id for array elements

const stopLossTrackingSchema = new Schema({
  buyPrice: { type: Number },
  highestPrice: { type: Number },
  trailingStopPrice: { type: Number },
  maxStopPrice: { type: Number },
  lastUpdate: { type: Date, default: Date.now },
  stopLossTriggered: { type: Boolean, default: false },
  takeProfitTriggered: { type: Boolean, default: false },
  triggerType: { type: String, enum: ['TSL', 'MSL', 'NONE'], default: 'NONE' },
  reEntryCount: { type: Number, default: 0 },
  lastSellPrice: { type: Number },
}, { _id: false });

const purchaseSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
    signature: { type: Schema.Types.String },
    trade_type: {
      type: Schema.Types.String,
      enum: tradeType,
    },
    minimumLiquidity: {
      type: Schema.Types.Number,
      default: 0,
    },
    wallet_address: { type: Schema.Types.String },
    in_amount: {
      type: Schema.Types.Number,
    },
    out_amount: {
      type: Schema.Types.Number,
    },
    availableToken: {
      type: Schema.Types.String,
    },
    status: {
      type: Schema.Types.String,
      enum: trade_status,
    },
    token_address: {
      type: Schema.Types.String,
    },
    token_price: {
      type: Schema.Types.Number,
    },
    token_liquidity: {
      type: Schema.Types.Number,
    },
    token_marketcap: {
      type: Schema.Types.String,
    },
    last_update: {
      type: Schema.Types.Date,
      default: Date.now(),
    },
    slippage: {
      type: Schema.Types.Number,
      default: 0,
    },
    gas_priority_fee: {
      type: Schema.Types.Number,
      default: 0,
    },
    sold: {
      type: Schema.Types.Boolean,
      default: false,
    },
    reEntryFlag: {
      type: Schema.Types.Boolean,
      default: false,
    },

    trade_from: {
      type: Schema.Types.String,
      enum: trade_from,
    },
    stop_loss: {
      type: [tradeConditionSchema],
      set: (value) => (value === undefined ? undefined : value),
    }, // Stop Loss conditions
    take_profit: {
      type: [tradeConditionSchema],
      set: (value) => (value === undefined ? undefined : value),
    },
    autoSellenable: {
      type: Schema.Types.Boolean,
      default: false,
    },
    stopLossTracking: { type: stopLossTrackingSchema, default: {} },
  },
  {
    timestamps: true,
  }
);

const purchaseModel = mongoose.model("purchase", purchaseSchema);
module.exports = purchaseModel;
