const mongoose = require('mongoose');
const { TRADE_TYPE, TRADE_STATUS, TRADE_FROM } = require('../utils/enum_helper');
const tradeType = Object.values(TRADE_TYPE);
const trade_from = Object.values(TRADE_FROM);
const trade_status = Object.values(TRADE_STATUS);
const { Schema } = mongoose;
const transactionSchema = new Schema({

    userId: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    signature: { type: Schema.Types.String },
    trade_type: {
        type: Schema.Types.String,
        enum: tradeType
    },
    availableToken:
    {
        type: Schema.Types.String
    },
    wallet_address: { type: Schema.Types.String },
    in_amount: { type: Schema.Types.Number },
    out_amount: { type: Schema.Types.Number },
    status: {
        type: Schema.Types.String,
        enum: trade_status
    },
    token_address: {
        type: Schema.Types.String
    },
    token_price: {
        type: Schema.Types.Number
    },
    token_liquidity: {
        type: Schema.Types.Number
    },
    token_marketcap: {
        type: Schema.Types.String
    },
    last_update: {
        type: Schema.Types.Date,
        default: Date.now()
    },
    slippage: {
        type: Schema.Types.Number,
        default: 0
    },
    gas_priority_fee: {
        type: Schema.Types.Number,
        default: 0
    },
    sold: {
        type: Schema.Types.Boolean,
        default: false
    },

    trade_from:{
        type: Schema.Types.String,
        enum: trade_from
    },
},
{
    timestamps: true,
});

const transcationModel = mongoose.model('transcation', transactionSchema);
module.exports = transcationModel;