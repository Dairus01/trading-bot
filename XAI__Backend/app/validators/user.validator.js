const Joi = require("joi");

const validateDirectBuy = (requestBody) => {
  const object = Joi.object({
    tokenAddress: Joi.string().required(),
    amountOfSol: Joi.number().required(),
  });

  const validatedObject = object.validate(requestBody);
  return validatedObject;
};

const validateDirectSell = (requestBody) => {
  const object = Joi.object({
    tokenAddress: Joi.string().required(),
    amountOfToken: Joi.number().required(),
  });

  const validatedObject = object.validate(requestBody);
  return validatedObject;
};

const validateAdvnaceBuy = (requestBody) => {
  const stopLossSchema = Joi.object({
    percentageLoss: Joi.number().min(0).max(100).required(), // Ensure valid percentage range
    sellPercentage: Joi.number().min(1).max(100).required(), // Must be a valid percentage
  });

  // const takeProfitSchema = Joi.object({
  //   percentageProfit: Joi.number().min(0).max(100).required(), // Ensure valid percentage range
  //   sellPercentage: Joi.number().min(1).max(100).required(), // Must be a valid percentage
  // });
  const reEntrySchema = Joi.object({
    percentage: Joi.number().min(0).max(100).required(), // Must be between 0-100
    solAmount: Joi.number().min(0).required(), // Cannot be negative
  });

  const object = Joi.object({
    autoSellenable: Joi.boolean().optional(),
    autoBuyEnable: Joi.boolean().optional(),
    checkLpBurn: Joi.boolean().optional(),
    OwnershipRenouncedCheck: Joi.boolean().optional(),
    minimunLp: Joi.number().optional(),
    autoBuyAmountOfSol: Joi.number().optional(),
    stop_loss: Joi.array().items(stopLossSchema).min(0).optional(), // At least one stop loss condition
    // take_profit: Joi.array().items(takeProfitSchema).min(0).optional(), // At least one take profit condition
    reEntry: reEntrySchema.optional(),
  })
    .min(1)
    .unknown();

  const validatedObject = object.validate(requestBody);
  return validatedObject;
};

const validateCommonSettings = (requestBody) => {
  const object = Joi.object({
    slippage: Joi.number().min(0).optional(),
    gasPriorityFee: Joi.number().min(0).optional(),
  });

  const validatedObject = object.validate(requestBody);
  return validatedObject;
};
const validateWithdrawValue = (requestBody) => {
  const object = Joi.object({
    amountOfSol: Joi.number().min(0).required(),
  });

  const validatedObject = object.validate(requestBody);
  return validatedObject;
};

const validateDepositValue = (requestBody) => {
  const object = Joi.object({
    amountOfSol: Joi.number().min(0).required(),
    walletAddress: Joi.string().required(),
  });

  const validatedObject = object.validate(requestBody);
  return validatedObject;
};

const validateAutoSell = (requestBody) => {
  const stopLossSchema = Joi.object({
    percentageLoss: Joi.number().min(0).max(100).required(), // Ensure valid percentage range
    sellPercentage: Joi.number().min(1).max(100).required(), // Must be a valid percentage
  });

  const takeProfitSchema = Joi.object({
    percentageProfit: Joi.number().min(0).max(100).required(), // Ensure valid percentage range
    sellPercentage: Joi.number().min(1).max(100).required(), // Must be a valid percentage
  });

  const schema = Joi.object({
    transactionId: Joi.string().required(),
    minimumLiquidity: Joi.number().min(0).required(),
    stop_loss: Joi.array().items(stopLossSchema).min(1).required(), // At least one stop loss condition
    take_profit: Joi.array().items(takeProfitSchema).min(1).required(), // At least one take profit condition
  });

  return schema.validate(requestBody);
};

module.exports = {
  validateCommonSettings,
  validateDirectBuy,
  validateDirectSell,
  validateWithdrawValue,
  validateDepositValue,
  validateAdvnaceBuy,
  validateAutoSell,
};
