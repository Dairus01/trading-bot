const { SOL } = require("../../configs/env");

const { HttpException } = require("../error/HttpException");
const errorType = require("../error/errorcodes");
const UserModel = require("../model/user.model");
const RaydiumAmmServiceV2 = require("../raydiumServices/raydium_helper.js");
const SolanaWeb3Helper = require("../utils/solanaWeb3.helper");
const cryptography = require("../utils/cryptography.js");
const purchaseModel = require("../model/purchase.model.js");
const transcationModel = require("../model/transcation.model.js");
const logger = require("log4js").getLogger("user service");
const RedisService = require("../utils/redis.service.js");
const scrappedTokenModel = require("../model/scrappedToken.model.js");
const { PublicKey } = require("@solana/web3.js");
const { getAssociatedTokenAddressSync } = require("@solana/spl-token");

class UserService {
  constructor() {
    this.raydiumAmmServiceV2 = new RaydiumAmmServiceV2();
    this.web3Helper = new SolanaWeb3Helper();
    this.redisService = new RedisService();
  }

  async getAllActiveSellsService({ id }) {
    const data = await purchaseModel.find({ userId: id, autoSellenable: true });
    return data;
  }

  async stopAndStartAutoBuyService({ id, autoBuyEnable }) {
    const data = await UserModel.findByIdAndUpdate(
      { _id: id },
      {
        $set: { autoBuyEnable },
      },
      {
        new: true,
      }
    );
    return data;
  }
  async stopAndStartAutoSellService({ id, transactionId, autoSellenable }) {
    const updateData = {
      autoSellenable,
    };
    const updatedTransaction = await purchaseModel.findOneAndUpdate(
      { _id: transactionId, userId: id },
      { $set: updateData },
      { new: true }
    );
    return updatedTransaction;
  }
  async fundWalletBalanceService({ id }) {
    const user = await UserModel.findById(id);
    const { adminFundWalletAddress } = user;
    const adminBalance = await this.web3Helper.getBalance(
      adminFundWalletAddress
    );
    const data = {
      balance: adminBalance / Math.pow(10, 9),
      walletAddress: adminFundWalletAddress,
    };
    return data;
  }
  async directBuyService({ id, inputValue }) {
    const { tokenAddress, amountOfSol } = inputValue;
    const user = await UserModel.findById(id);
    const {
      slippage,
      gasPriorityFee,
      sercetKeyFundWalletAddress,
      adminFundWalletAddress,
    } = user;

    const amountInDecimals = amountOfSol * Math.pow(10, 9);

    const input = {
      fromMint: SOL,
      toMint: tokenAddress,
      owner: adminFundWalletAddress,
      slippage,
      amount: amountInDecimals,
      secretKey: sercetKeyFundWalletAddress,
      gasPriorityFee,
      reEntryFlag: false,
    };
    const data = await this.raydiumAmmServiceV2.getSwapTx({
      input,
      autoBuyEnable: false,
      userId: id,
    });
    if (data?.isSuccess === false) {
      return { isSuccess: false, error: data?.error || 'Buy transaction failed' };
    }
    return data;
  }

  async advanceBuyService({ id, inputValue }) {
    const {
      checkLpBurn,
      OwnershipRenouncedCheck,
      minimunLp,
      autoBuyAmountOfSol,
      stop_loss,
      take_profit,
      autoSellenable,
      autoBuyEnable,
      reEntry,
    } = inputValue;

    const updateFields = {};
    if (checkLpBurn !== undefined) updateFields.checkLpBurn = checkLpBurn;
    if (OwnershipRenouncedCheck !== undefined)
      updateFields.OwnershipRenouncedCheck = OwnershipRenouncedCheck;
    if (minimunLp !== undefined) updateFields.minimunLp = minimunLp;
    if (autoBuyAmountOfSol !== undefined) {
      updateFields.autoBuyAmountOfSol = autoBuyAmountOfSol * Math.pow(10, 9);
    }
    if (autoSellenable !== undefined)
      updateFields.autoSellenable = autoSellenable;
    if (autoBuyEnable !== undefined) updateFields.autoBuyEnable = autoBuyEnable;

    if (stop_loss !== undefined) updateFields.stop_loss = stop_loss; // Assigning directly as an array
    if (take_profit !== undefined) updateFields.take_profit = take_profit; // Assigning directly as an array
    if (reEntry !== undefined) {
      updateFields.reEntry = reEntry;
      updateFields.reEntry.solAmount = reEntry.solAmount * Math.pow(10, 9);
    }

    const user = await UserModel.findByIdAndUpdate(
      { _id: id },
      { $set: updateFields }, // Only using $set inside MongoDB update, not in cache
      { new: true } // Returns updated document
    );
    const cacheData = {
      slippage: user.slippage,
      userId: user._id,
      adminFundWalletAddress: user.adminFundWalletAddress,
      gasPriorityFee: user.gasPriorityFee,
      sercetKeyFundWalletAddress: user.sercetKeyFundWalletAddress,
      ...updateFields, // Merging updated fields directly, no need for `$set`
    };

    // Store updated data in Redis cache
    await this.redisService.storeUserSettingsInCaches(id, cacheData);
    return user;
  }

  async getSecretKey({ id }) {
    console.log("id: ", id);
    const user = await UserModel.findById(id);
    const key = await cryptography.decrypt(user.sercetKeyFundWalletAddress);
    return key;
  }

  async getSetCriteriaService({ id }) {
    const user = await UserModel.findById(
      id,
      "autoBuyAmountOfSol autoSellenable stop_loss take_profit autoBuyEnable minimunLp OwnershipRenouncedCheck checkLpBurn slippage gasPriorityFee, reEntry"
    );
    user.autoBuyAmountOfSol = user.autoBuyAmountOfSol / Math.pow(10, 9);
    user.reEntry.solAmount = user.reEntry.solAmount / Math.pow(10, 9);
    user.slippage = user.slippage / 100;
    user.gasPriorityFee = user.gasPriorityFee / Math.pow(10, 9);

    return user;
  }

  async directSellService({ id, inputValue }) {
    const user = await UserModel.findById(id);

    let { tokenAddress, amountOfToken } = inputValue;
    const { decimals } = await this.web3Helper.getTokenDecimal(tokenAddress);

    if (!decimals) {
      throw new HttpException(
        errorType.TOKEN_ERROR.status,
        errorType.TOKEN_ERROR.message
      );
    }
    amountOfToken = amountOfToken * Math.pow(10, decimals);
    const {
      slippage,
      gasPriorityFee,
      sercetKeyFundWalletAddress,
      adminFundWalletAddress,
    } = user;
    const input = {
      fromMint: tokenAddress,
      toMint: SOL,
      owner: adminFundWalletAddress,
      slippage,
      amount: amountOfToken,
      secretKey: sercetKeyFundWalletAddress,
      gasPriorityFee,
      reEntryFlag: false,
    };
    const data = await this.raydiumAmmServiceV2.getSwapTx({
      input,
      autoBuyEnable: false,
      userId: id,
    });
    return data;
  }

  async advanceSellService({ id, inputValue }) {
    const { stop_loss, take_profit, transactionId, minimumLiquidity } =
      inputValue;
    const data = await purchaseModel.findOne({
      userId: id,
      _id: transactionId,
    });

    if (!data) {
      throw new HttpException(
        errorType.NOT_FOUND.status,
        "Transaction not found"
      );
    }

    // Helper function to update stop_loss and take_profit fields
    const updateFields = (currentFields = [], newFields = []) => {
      if (!Array.isArray(newFields) || newFields.length === 0)
        return currentFields;

      // Convert current fields into a map for quick lookup
      const currentFieldsMap = new Map(
        currentFields.map((field) => [
          field.percentageLoss ?? field.percentageProfit,
          field,
        ])
      );

      // Update existing fields or add new ones
      newFields.forEach((field) => {
        const key = field.percentageLoss ?? field.percentageProfit;
        if (currentFieldsMap.has(key)) {
          currentFieldsMap.get(key).sellPercentage = field.sellPercentage;
        } else {
          currentFieldsMap.set(key, field);
        }
      });

      return Array.from(currentFieldsMap.values());
    };

    // Update `stop_loss` and `take_profit`
    const updatedStopLoss = updateFields(data.stop_loss || [], stop_loss || []);
    const updatedTakeProfit = updateFields(
      data.take_profit || [],
      take_profit || []
    );

    // Prepare update object
    const updateData = {
      stop_loss: updatedStopLoss,
      take_profit: updatedTakeProfit,
      autoSellenable: true,
    };

    // Only update `minimumLiquidity` if it is provided
    if (minimumLiquidity !== undefined) {
      updateData.minimumLiquidity = minimumLiquidity;
    }

    // Perform update in MongoDB
    const updatedTransaction = await purchaseModel.findOneAndUpdate(
      { _id: transactionId, userId: id },
      { $set: updateData },
      { new: true }
    );

    if (!updatedTransaction) {
      throw new HttpException(errorType.NOT_FOUND.status, "User not found");
    }

    const cacheData = {
      transactionId,
      userId: id,
      stop_loss,
      take_profit,
      minimumLiquidity,
      advancedStopLoss: user.advancedStopLoss || {},
    };

    await this.redisService.setTokenConfigSettings(transactionId, cacheData);

    logger.info(`Auto-sell criteria updated for user ${id}`);
    return updatedTransaction;
  }

  async transactionSettingService({ id, inputValue }) {
    const { gasPriorityFee, slippage } = inputValue;
    const updatedFields = {};
    if (gasPriorityFee !== undefined) {
      updatedFields.gasPriorityFee = gasPriorityFee * 1000000000;
    }
    if (slippage !== undefined) {
      updatedFields.slippage = slippage * 100;
    }

    const user = await UserModel.findByIdAndUpdate({ _id: id }, updatedFields, {
      new: true,
    });
    await user.save();
    return user;
  }

  async withdrawSol(id, inputValue) {
    const user = await UserModel.findById(id);
    const { amountOfSol } = inputValue;
    const {
      adminFundWalletAddress,
      withdrawWalletAddress,
      sercetKeyFundWalletAddress,
    } = user;
    const privateKey = await cryptography.decrypt(sercetKeyFundWalletAddress);
    const txn = await this.web3Helper.withdrawHelper(
      amountOfSol,
      adminFundWalletAddress,
      withdrawWalletAddress,
      privateKey
    );
    return txn;
  }

  async depositSol({ id, inputValue }) {
    const user = await UserModel.findById(id);

    const { amountOfSol, walletAddress } = inputValue;
    const { adminFundWalletAddress } = user;
    const txn = await this.web3Helper.depositHelper(
      amountOfSol,
      walletAddress,
      adminFundWalletAddress
    );
    return txn;
  }

  async getTokenHolding({ id, skip, limit }) {
    const filterCon = { userId: id, availableToken: { $gt: 0 } };
    const totalCount = await purchaseModel.countDocuments(filterCon); // Get total records count
    const data = await purchaseModel
      .find(filterCon)
      .sort({ availableToken: -1 })
      .collation({ locale: "en", numericOrdering: true })
      .skip(skip)
      .limit(limit);

    // Sync token balances with actual blockchain state
    const syncedData = await Promise.all(
      data.map(async (token) => {
        try {
          // Get user wallet address
          const user = await UserModel.findById(id);
          if (!user || !user.adminFundWalletAddress) {
            return token;
          }

          // Get actual token balance from blockchain
          const associatedTokenAddress = getAssociatedTokenAddressSync(
            new PublicKey(token.token_address),
            new PublicKey(user.adminFundWalletAddress)
          );

          const tokenBalance = await this.raydiumAmmServiceV2.connection.getTokenAccountBalance(
            associatedTokenAddress
          );

          const actualBalance = Number(tokenBalance.value.amount);
          const databaseBalance = Number(token.availableToken);

          // If blockchain balance is different from database balance, update database
          if (actualBalance !== databaseBalance) {
            console.log(`Syncing token ${token.token_address}: DB=${databaseBalance}, Blockchain=${actualBalance}`);
            
            if (actualBalance === 0) {
              // Token has been sold externally, mark as sold
              await purchaseModel.findByIdAndUpdate(token._id, {
                availableToken: 0,
                sold: true,
                last_update: new Date()
              });
              return null; // Don't include in results
            } else {
              // Update with actual balance
              await purchaseModel.findByIdAndUpdate(token._id, {
                availableToken: actualBalance,
                last_update: new Date()
              });
              
              // Return updated token data
              return {
                ...token.toObject(),
                availableToken: actualBalance
              };
            }
          }

          return token;
        } catch (error) {
          console.error(`Error syncing token ${token.token_address}:`, error);
          return token; // Return original data if sync fails
        }
      })
    );

    // Filter out null values (tokens that were sold externally)
    const filteredData = syncedData.filter(token => token !== null);

    return { data: filteredData, totalCount: filteredData.length };
  }

  async purchaseTableService({ id, skip, limit }) {
    const totalCount = await purchaseModel.countDocuments({ userId: id }); // Get total records count
    const data = await purchaseModel
      .find({ userId: id })
      .skip(skip)
      .limit(limit);

    return { data, totalCount };
  }

  async transactionHistoryService({ id, skip, limit }) {
    const totalCount = await transcationModel.countDocuments({ userId: id }); // Get total records count
    const data = await transcationModel
      .find({ userId: id })
      .sort({ createdAt: -1 }) // ✅ Sort by latest first
      .skip(skip)
      .limit(limit);

    return { data, totalCount };
  }

  async getScrappedTokenService({ skip, limit, type }) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const filter = {
      platform: type,
      createdAt: { $gte: startOfToday, $lte: endOfToday },
    };
    const totalCount = await scrappedTokenModel.countDocuments(filter); // Get total records count
    const data = await scrappedTokenModel
      .find(filter)
      .sort({ updatedAt: -1 }) // ✅ Sort by latest first
      .skip(skip)
      .limit(limit);

    return { data, totalCount };
  }
}
module.exports = UserService;
