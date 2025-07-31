module.exports = {

    STATUS_TYPE: Object.freeze({
        ACTIVE: 'active',
        INACTIVE: 'inactive'
    }),
    SERVICES: Object.freeze({
        PUMP_FUN: 'pump.fun',
        RADIYUM: 'raydium',
        GRADUATED: 'graduated',
        MANUAL: 'manual'
    }),
    TRADE_TYPE: Object.freeze({
        SELL: 'sell',
        BUY: 'buy'
    }),
    TRADE_STATUS: Object.freeze({
        SUCCESS: 'success',
        FAIL: 'fail',
        PENDING: 'pending'
    }),
    DEX_TYPE: Object.freeze({
        PUMPDOTFUN: 'pumpDotFun',
        RAYDIUM_AMM: 'raydium'
    }),

    TRADE_FROM: Object.freeze({
        MANUAL: 'manual',
        AUTO: 'auto'
    })

}
