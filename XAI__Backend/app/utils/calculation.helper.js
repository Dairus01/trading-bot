const evaluateTakeProfit = async (currentPrice, buyPrice, tiers) => {
  const profitPercentage = Math.abs(
    ((currentPrice - buyPrice) / buyPrice) * 100
  );
  tiers.sort((x, y) => y.percentageProfit - x.percentageProfit);
  const a = tiers.find((tier) => profitPercentage >= tier.percentageProfit);
  return a;
};

const evaluateStopLoss = async (currentPrice, buyPrice, tiers) => {
  console.log("Stop loss calling: ", tiers);
  const lossPercentage = Math.abs(((currentPrice - buyPrice) / buyPrice) * 100);
  console.log("lossPercentage: ", lossPercentage);
  tiers.sort((x, y) => y.percentageLoss - x.percentageLoss);
  const data = tiers.find((tier) => lossPercentage >= tier.percentageLoss);
  console.log("filtered data: ", data);
  return data;
};

module.exports = {
  evaluateTakeProfit,
  evaluateStopLoss,
};
