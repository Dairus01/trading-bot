const logger = require("log4js").getLogger("reEntry-service");
const purchaseModel = require("../../app/model/purchase.model"); // Adjust path as needed
const RaydiumHelper = require("../../app/raydiumServices/raydium_helper"); // Adjust path
const RaydiumAmmServiceV2 = require("../../app/raydiumServices/raydium_helper");
const SolanWeb3Helper = require("../../app/utils/solanaWeb3.helper");

const { addTokenForAutoBuy } = require("../add_task"); // Adjust path as needed
const { SOL } = require("../../configs/env"); // Adjust path
const userModel = require("../../app/model/user.model");

class ReEntry {
  constructor() {
    this.RaydiumHelper = new RaydiumHelper();
    this.raydiumAmmService = new RaydiumAmmServiceV2();
    this.web3Helper = new SolanWeb3Helper();
  }
  async reEntryWorker() {
    try {
      logger.info("Starting reEntry worker...");
      const user = await userModel.findOne({});
      if (!user) {
        logger.warn("No user found. Exiting re-entry worker.");
        return;
      }

      const reEntryPercentage = user?.reEntry?.percentage || 0;
      const secretKey = user.sercetKeyFundWalletAddress; // or wherever your secret key is stored

      if (reEntryPercentage == 0) {
        return;
      }

      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      // Fetch only re-entry purchases from the last 7 days
      const reEntryPurchases = await purchaseModel.find({
        reEntryFlag: true,
        createdAt: { $gte: oneWeekAgo },
      });

      if (!reEntryPurchases.length) {
        logger.info("No re-entry tokens found.");
        return;
      }

      logger.info(`Found ${reEntryPurchases.length} purchase(s) for re-entry.`);

      // 2. Loop through each purchase document
      for (const purchase of reEntryPurchases) {
        const tokenAddress = purchase.token_address;
        if (!tokenAddress) {
          logger.warn(
            `Purchase document ${purchase._id} has no token_address.`
          );
          continue;
        }
        const updatedValues =
          await this.RaydiumHelper.getTokenPriceLiquidityMarketCap(
            tokenAddress,
            secretKey
          );

        if (!updatedValues?.tokenPriceInUsdc) {
          logger.warn(
            `No valid tokenPriceInUsdc returned for ${tokenAddress}—skipping.`
          );
          continue;
        }

        const newPrice = updatedValues.tokenPriceInUsdc;
        const oldPrice = purchase.token_price || 0;

        logger.info(
          ` oldPrice=${oldPrice},\n newPrice=${newPrice}, \n reEntryPercentage=${reEntryPercentage}%`
        );

        const thresholdPrice = oldPrice * (1 + reEntryPercentage / 100);

        console.log("thresholdPrice:  ", thresholdPrice);

        if (newPrice >= thresholdPrice) {
          // 3. Use your Raydium helper to find the relevant pool address
          const poolAddress =
            await this.RaydiumHelper.findPoolAddressForMintAddress(
              SOL,
              tokenAddress
            );

          if (!poolAddress) {
            logger.info(
              `No Raydium pool found for token address ${tokenAddress}. Skipping.`
            );
            continue;
          }

          logger.info(
            `Found Raydium pool address for ${tokenAddress}: ${poolAddress}`
          );

          // 4. Construct whatever data is needed and queue the token for auto-buy

          logger.info(`Queued ${tokenAddress} for auto-buy.`);
          const input = {
            fromMint: SOL,
            toMint: tokenAddress,
            slippage: user.slippage,
            owner: user.adminFundWalletAddress,
            amount: user.reEntry.solAmount,
            secretKey: secretKey,
            gasPriorityFee: user.gasPriorityFee,
            reEntryFlag: false,
          };
          await this.raydiumAmmService.getSwapTx({
            input,
            autoBuyEnable: true,
            userId: user._id,
          });
        } else {
          logger.info(
            `New price ${newPrice} NOT above threshold (${thresholdPrice}); no re-buy for ${tokenAddress}.`
          );
        }
      }
    } catch (error) {
      logger.error("Error in reEntryWorker:", error);
    }
  }
}

module.exports = new ReEntry();
