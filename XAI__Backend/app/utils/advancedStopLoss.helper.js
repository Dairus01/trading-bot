// Advanced Stop Loss Helper
class AdvancedStopLossHelper {
  // Calculate TSL based on highest price reached
  static calculateTrailingStopLoss(buyPrice, highestPrice, tslPercentage) {
    if (!tslPercentage || !highestPrice) return null;
    const tslPrice = highestPrice * (1 - tslPercentage / 100);
    return Math.max(tslPrice, buyPrice * (1 - tslPercentage / 100)); // Never below buy price
  }

  // Calculate MSL based on buy price
  static calculateMaxStopLoss(buyPrice, mslPercentage) {
    if (!mslPercentage) return null;
    return buyPrice * (1 - mslPercentage / 100);
  }

  // Main logic: TSL vs MSL comparison
  static evaluateStopLossLogic(currentPrice, buyPrice, highestPrice, tslConfig, mslConfig, logicType = 'TSL_MSL_COMBINED') {
    const tslPrice = tslConfig?.enabled ? this.calculateTrailingStopLoss(buyPrice, highestPrice, tslConfig.percentage) : null;
    const mslPrice = mslConfig?.enabled ? this.calculateMaxStopLoss(buyPrice, mslConfig.percentage) : null;
    let effectiveStopPrice = null;
    let triggerType = 'NONE';

    if (logicType === 'TSL_ONLY' && tslPrice !== null) {
      effectiveStopPrice = tslPrice;
      triggerType = 'TSL';
    } else if (logicType === 'MSL_ONLY' && mslPrice !== null) {
      effectiveStopPrice = mslPrice;
      triggerType = 'MSL';
    } else if (logicType === 'TSL_MSL_COMBINED' && tslPrice !== null && mslPrice !== null) {
      // Logic 1: If TSL > MSL → cancel MSL, TSL becomes new MSL
      if (tslPrice > mslPrice) {
        effectiveStopPrice = tslPrice;
        triggerType = 'TSL';
      }
      // Logic 2: If TSL < MSL → use MSL
      else if (tslPrice < mslPrice) {
        effectiveStopPrice = mslPrice;
        triggerType = 'MSL';
      }
      // Logic 4: If TSL = MSL → use MSL
      else {
        effectiveStopPrice = mslPrice;
        triggerType = 'MSL';
      }
    }
    // If only one is enabled
    else if (tslPrice !== null) {
      effectiveStopPrice = tslPrice;
      triggerType = 'TSL';
    } else if (mslPrice !== null) {
      effectiveStopPrice = mslPrice;
      triggerType = 'MSL';
    }

    // Check if stop loss is triggered
    const isTriggered = effectiveStopPrice !== null && currentPrice <= effectiveStopPrice;

    return {
      isTriggered,
      triggerType,
      effectiveStopPrice,
      tslPrice,
      mslPrice,
      currentPrice
    };
  }

  // Calculate re-entry price
  static calculateReEntryPrice(mslPrice, offsetPercentage) {
    if (!mslPrice || !offsetPercentage) return null;
    return mslPrice * (1 + offsetPercentage / 100);
  }
}

module.exports = AdvancedStopLossHelper; 