const mongoose = require("mongoose");
const { Schema } = mongoose;
const tradeConditionSchema = new Schema(
  {
    percentageLoss: { type: Number, min: 0, max: 100 }, // Percentage values (0-100)
    percentageProfit: { type: Number, min: 0, max: 100 }, // Profit condition (0-100)
    sellPercentage: { type: Number, min: 1, max: 100, required: true }, // Sell percentage (1-100)
  },
  { _id: false }
); // Disable automatic _id for array elements

const advancedStopLossSchema = new Schema({
  trailingStopLoss: {
    enabled: { type: Boolean, default: false },
    percentage: { type: Number, min: 0, max: 100 },
    activationPrice: { type: Number },
    currentStopPrice: { type: Number },
  },
  maxStopLoss: {
    enabled: { type: Boolean, default: false },
    percentage: { type: Number, min: 0, max: 100 },
    fixedStopPrice: { type: Number },
  },
  stopLossLogic: {
    type: String,
    enum: ['TSL_ONLY', 'MSL_ONLY', 'TSL_MSL_COMBINED'],
    default: 'TSL_MSL_COMBINED',
  },
             reEntrySettings: {
             enabled: { type: Boolean, default: false },
             offsetPercentage: { type: Number, min: 0, max: 50 },
             maxReEntries: { type: Number, min: 1, max: 100, default: 3 },
             currentReEntries: { type: Number, default: 0 },
           },
}, { _id: false });

const userSchema = new Schema(
  {
    walletAddress: {
      type: Schema.Types.String,
      unique: [true, "wallet address is already in taken"],
      sparse: true,
    },
    amountOfToken: {
      type: Schema.Types.Number,
    },
    amountOfSol: {
      type: Schema.Types.Number,
    },
    slippage: {
      type: Schema.Types.Number,
      default: 300,
    },
    autoBuyEnable: {
      type: Schema.Types.Boolean,
      default: true,
    },
    adminFundWalletAddress: {
      type: Schema.Types.String,
    },
    sercetKeyFundWalletAddress: {
      type: Schema.Types.String,
    },

    withdrawWalletAddress: {
      type: Schema.Types.String,
      unique: [true, "wallet address is already in taken"],
      sparse: true,
    },

    gasPriorityFee: {
      type: Schema.Types.Number,
      default: 100000,
    },
    autoBuyAmountOfSol: {
      type: Schema.Types.Number,
      default: 0,
    },
    checkLpBurn: {
      type: Schema.Types.Boolean,
    },
    OwnershipRenouncedCheck: {
      type: Schema.Types.Boolean,
    },
    minimunLp: {
      type: Schema.Types.Number,
      default: 0,
    },
    reEntry: {
      percentage: {
        type: Schema.Types.Number,
        default: 0,
      },
      solAmount: {
        type: Schema.Types.Number,
        default: 0,
      },
    },
    stop_loss: {
      type: [tradeConditionSchema],
      set: (value) => (value === undefined ? undefined : value),
    }, // Stop Loss conditions
    take_profit: {
      type: [tradeConditionSchema],
      set: (value) => (value === undefined ? undefined : value),
    }, // Take Profit conditions
    autoSellenable: {
      type: Schema.Types.Boolean,
      default: true,
    },
    advancedStopLoss: { type: advancedStopLossSchema, default: {} },
  },
  {
    timestamps: true,
  }
);
const userModel = mongoose.model("User", userSchema);
module.exports = userModel;
