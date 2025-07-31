const cryptography = require("../../app/utils/cryptography");
const UserModel = require("../../app/model/user.model");
const BuyCondition = require("../../app/utils/buyConditions");
const RaydiumAmmServiceV2 = require("../../app/raydiumServices/raydium_helper");
const RedisService = require("../../app/utils/redis.service");
const { SOL } = require("../../configs/env");
const logger = require("log4js").getLogger("trade-worker");
const {
  evaluateStopLoss,
  evaluateTakeProfit,
} = require("../../app/utils/calculation.helper");
const purchaseModel = require("../../app/model/purchase.model");
const { TRADE_TYPE, TRADE_STATUS } = require("../../app/utils/enum_helper");
const {
  matchRaydiumTokenForSellWorker,
  addTokenForFinalSell,
} = require("../add_task");
const SolanWeb3Helper = require("../../app/utils/solanaWeb3.helper");
const { min } = require("../../app/utils/rpcLoadBalancer");
const { getAssociatedTokenAddress } = require("@solana/spl-token");
const { PublicKey } = require("@solana/web3.js");
const scrappedTokenModel = require("../../app/model/scrappedToken.model");
const AdvancedStopLossHelper = require('../../app/utils/advancedStopLoss.helper');
class Trade {
  constructor() {
    this.buyCondition = new BuyCondition();
    this.raydiumAmmService = new RaydiumAmmServiceV2();
    this.web3Helper = new SolanWeb3Helper();
    this.redisService = new RedisService();
    this.isProcessing = false;
  }

  async buyWorker(job) {
    try {
      logger.info(
        `🚀 Processing Job ${job.id}, Attempt ${job.attemptsMade + 1}/${
          job.opts.attempts
        }`
      );
      const { data } = job.data;
      let {
        slippage,
        gasPriorityFee,
        OwnershipRenouncedCheck,
        checkLpBurn,
        minimunLp,
        adminFundWalletAddress,
        _id,
        sercetKeyFundWalletAddress,
        autoBuyAmountOfSol,
        autoBuyEnable,
      } = await UserModel.findOne({});
      let tokenAddress =
        data?.baseMint === SOL ? data?.quoteMint : data?.baseMint;
      let secretKey = await cryptography.decrypt(sercetKeyFundWalletAddress);

      let poolId = data?.poolId;

      let LpBurn = await this.buyCondition.checkLpBurn(secretKey, poolId);

      if (autoBuyEnable) {
        let tempData = {
          tokenAddress: tokenAddress,
          poolId: poolId,
          status: "success",
          platform: "sniper",
        };

        await scrappedTokenModel.findOneAndUpdate(
          { tokenAddress: tokenAddress, platform: "sniper" }, // filter
          {
            tokenAddress: tokenAddress,
            poolId: poolId,
            status: "success",
            platform: "sniper",
          }, // update data
          {
            upsert: true,
            new: true, // return the updated or created document
            setDefaultsOnInsert: true,
          }
        );
        console.log("Scrapped token added from sniper successfully");
      }

      if (data?.autoBuyEnable && data.autoBuyEnable == true) {
        autoBuyEnable = true;
        console.log("Buying Token from Discord");
      }
      /***************************************************************/

      // Users or project owners can decide to burn LP tokens at any time in the future.
      // They might burn LP immediately after creating the pool or after a certain period.

      /*************************************************************** */
      let OwnershipRenounced = await this.buyCondition.OwnershipRenouncedCheck(
        tokenAddress
      );

      let { liquidity } =
        await this.raydiumAmmService.getTokenPriceLiquidityMarketCap(
          tokenAddress,
          sercetKeyFundWalletAddress
        );
      console.log("liquidity: ", liquidity);
      console.log("required minimunLp; ", minimunLp);

      // if (
      //   autoBuyEnable &&
      //   OwnershipRenounced !== undefined &&
      //   OwnershipRenounced === OwnershipRenouncedCheck &&
      //   minimunLp !== undefined &&
      //   minimunLp > 0 &&
      //   liquidity >= minimunLp &&
      //   LpBurn !== undefined &&
      //   LpBurn === checkLpBurn
      // ) {
      //   const input = {
      //     fromMint: SOL,
      //     toMint: tokenAddress,
      //     slippage,
      //     owner: adminFundWalletAddress,
      //     amount: autoBuyAmountOfSol,
      //     secretKey: sercetKeyFundWalletAddress,
      //     gasPriorityFee,
      //     reEntryFlag: false,
      //   };
      //   console.log("step 7");
      //   await this.raydiumAmmService.getSwapTx({
      //     input,
      //     autoBuyEnable: true,
      //     userId: _id,
      //   });
      //   console.log("step 8");
      // }

      if (
        autoBuyEnable &&
        minimunLp !== undefined &&
        minimunLp > 0 &&
        liquidity >= minimunLp
      ) {
        if (
          OwnershipRenouncedCheck == true &&
          OwnershipRenounced != OwnershipRenouncedCheck
        ) {
          console.log("Condition of ownerShip does not matches");
          console.log("token OwnershipRenounced: ", OwnershipRenounced);
          console.log(
            "database saved OwnershipRenouncedCheck: ",
            OwnershipRenouncedCheck
          );

          return;
        }

        console.log("*******************");

        if (checkLpBurn == true && LpBurn == checkLpBurn) {
          console.log("Condition of LpBurn does not matches");
          console.log("token LpBurn: ", LpBurn);
          console.log("database saved LpBurn: ", checkLpBurn);
          return;
        }

        console.log("*******************");

        const input = {
          fromMint: SOL,
          toMint: tokenAddress,
          slippage,
          owner: adminFundWalletAddress,
          amount: autoBuyAmountOfSol,
          secretKey: sercetKeyFundWalletAddress,
          gasPriorityFee,
          reEntryFlag: false,
        };
        console.log("step 7");
        await this.raydiumAmmService.getSwapTx({
          input,
          autoBuyEnable: true,
          userId: _id,
        });
        console.log("step 8");
      }
    } catch (err) {
      logger.error(
        `khatam ❌ Job ${job.id} failed on attempt ${job.attemptsMade + 1}/${
          job.opts.attempts
        }: ${err.message}`
      );
      throw err; // Important: Rethrow error so BullMQ can retry
    }
  }

  async evaluateTrade(miniLiquidity, currentLiquidity) {
    return (
      Number(miniLiquidity) > 0 &&
      Number(miniLiquidity) <= Number(currentLiquidity)
    );
  }

  async RaydiumTokenSellWorker(job) {
    try {
      console.log("🔄 ====================== RAYDIUM TOKEN SELL WORKER ======================");
      const {
        userDetails,
        token_address,
        newAmount,
        transactionId,
        reEntryFlag,
      } = job.data;

      console.log(`📋 Sell job data:`, {
        token_address,
        newAmount,
        transactionId,
        reEntryFlag,
        userId: userDetails?.userId
      });

      const perTokenDetails = await this.redisService.getTokenFromCache(transactionId);
      console.log(`📊 Token details from cache:`, perTokenDetails ? 'Found' : 'Not found');
      
      console.log(`💰 Executing sell for ${newAmount} tokens of ${token_address}`);
      const bool = await this.executeSwapTransaction(
        userDetails,
        token_address,
        newAmount,
        reEntryFlag
      );
      
      console.log(`🎯 Sell execution result: ${bool ? 'SUCCESS' : 'FAILED'}`);
      
      if (bool) {
        console.log(`✅ Sell successful, removing token from cache: ${token_address}`);
        await this.redisService.removeSoldToken(token_address);
        // Update inTransit to false to indicate successful sale
        await this.redisService.updateTokenInCache(token_address, {
          inTransit: false,
        });
        console.log(`✅ Token ${token_address} marked as sold successfully`);
      } else {
        console.log(`❌ Sell failed for token: ${token_address}`);
      }

      logger.info("Token added for match criteria for selling token");
    } catch (error) {
      console.log(`❌ RaydiumTokenSellWorker error:`, error.message);
      logger.error(error);
      await this.redisService.updateTokenInCache(token_address, {
        inTransit: false,
      });

      return Promise.reject(error.message);
    }
  }
  async TokenPriceMonitorWorker(job) {
    try {
      // Handle both job object and direct data
      const jobData = job.data || job;
      
      if (!jobData) {
        console.error("No job data provided to TokenPriceMonitorWorker");
        return;
      }

      const { token_address, transactionId, token_price, userId } = jobData;
      
      if (!userId) {
        console.error("No userId found in job data:", jobData);
        return;
      }

      // Get user details from database using userId
      let userDetails = await this.redisService.getUserSettingsFromCache(userId);
      
      if (!userDetails) {
        console.log("User details not found in cache, fetching from database...");
        // Fetch from database if not in cache
        userDetails = await UserModel.findById(userId);
        if (userDetails) {
          // Store in cache for future use
          await this.redisService.storeUserSettingsInCaches(userId, userDetails.toObject());
          console.log("✅ User settings stored in cache");
        }
      }
      
      if (!userDetails) {
        console.error("User details not found for userId:", userId);
        return;
      }

      const perTokenDetails = await this.redisService.getTokenFromCache(transactionId);
      if (!perTokenDetails) {
        console.error(`Token details not found in cache for transactionId: ${transactionId}`);
        return;
      }
      if (!perTokenDetails.stopLossTracking) perTokenDetails.stopLossTracking = {};

      // Initialize tracking if not exists
      if (!perTokenDetails.stopLossTracking.buyPrice) {
        perTokenDetails.stopLossTracking.buyPrice = token_price;
        perTokenDetails.stopLossTracking.highestPrice = token_price;
        perTokenDetails.stopLossTracking.reEntryCount = 0;
        perTokenDetails.stopLossTracking.stopLossTriggered = false;
        perTokenDetails.stopLossTracking.takeProfitTriggered = false;
        perTokenDetails.stopLossTracking.lastSellPrice = null;
      }

      const advSL = userDetails.advancedStopLoss || {};
      const tslConfig = advSL.trailingStopLoss || {};
      const mslConfig = advSL.maxStopLoss || {};
      const logicType = advSL.stopLossLogic || 'TSL_MSL_COMBINED';
      const reEntrySettings = advSL.reEntrySettings || {};
      
      console.log(`🔧 User Settings Loaded:`);
      console.log(`   - TSL Enabled: ${tslConfig.enabled}, Percentage: ${tslConfig.percentage}%`);
      console.log(`   - MSL Enabled: ${mslConfig.enabled}, Percentage: ${mslConfig.percentage}%`);
      console.log(`   - Logic Type: ${logicType}`);
      console.log(`   - Re-entry Enabled: ${reEntrySettings.enabled}, Offset: ${reEntrySettings.offsetPercentage}%, Max: ${reEntrySettings.maxReEntries}`);
      console.log(`   - Auto Buy Amount: ${userDetails.autoBuyAmountOfSol} SOL`);

      let token_updated_values =
        await this.raydiumAmmService.getTokenPriceLiquidityMarketCap(
          token_address,
          userDetails.sercetKeyFundWalletAddress
        );
      const currentPrice = token_updated_values.tokenPriceInUsdc;
      const buyPrice = perTokenDetails.stopLossTracking.buyPrice;

      // Update highest price for TSL
      if (!perTokenDetails.stopLossTracking.highestPrice || currentPrice > perTokenDetails.stopLossTracking.highestPrice) {
        perTokenDetails.stopLossTracking.highestPrice = currentPrice;
      }
      
      console.log(`📊 Token State: Current Price: ${currentPrice}, Buy Price: ${buyPrice}, Highest Price: ${perTokenDetails.stopLossTracking.highestPrice}`);
      console.log(`📊 Tracking State: Stop Loss Triggered: ${perTokenDetails.stopLossTracking.stopLossTriggered}, Take Profit Triggered: ${perTokenDetails.stopLossTracking.takeProfitTriggered}, Re-entry Count: ${perTokenDetails.stopLossTracking.reEntryCount}`);

      let wasSold = false;
      let wasBought = false;

      // Check if we need to re-enter after a stop loss sell
      if (perTokenDetails.stopLossTracking.stopLossTriggered && 
          reEntrySettings.enabled && 
          perTokenDetails.stopLossTracking.reEntryCount < reEntrySettings.maxReEntries) {
        
        const lastSellPrice = perTokenDetails.stopLossTracking.lastSellPrice || buyPrice;
        const reEntryPrice = AdvancedStopLossHelper.calculateReEntryPrice(
          lastSellPrice,
          reEntrySettings.offsetPercentage
        );

        console.log(`🔍 Re-entry Check: Current Price: ${currentPrice}, Last Sell Price: ${lastSellPrice}, Re-entry Price: ${reEntryPrice}, Offset: ${reEntrySettings.offsetPercentage}%`);
        console.log(`🔍 Re-entry Status: Triggered: ${perTokenDetails.stopLossTracking.stopLossTriggered}, Enabled: ${reEntrySettings.enabled}, Count: ${perTokenDetails.stopLossTracking.reEntryCount}/${reEntrySettings.maxReEntries}`);

                  if (currentPrice >= reEntryPrice) {
            console.log(`🚀 Re-entry triggered: Current price ${currentPrice} >= Re-entry price ${reEntryPrice}`);
            
            // Execute re-entry buy (amount will be calculated from remaining SOL balance)
            console.log(`💰 Executing re-entry buy with remaining SOL balance`);
            const buyResult = await this.executeReEntryBuy(userDetails, token_address, null, transactionId);
          
          if (buyResult) {
            wasBought = true;
            perTokenDetails.stopLossTracking.reEntryCount += 1;
            perTokenDetails.stopLossTracking.stopLossTriggered = false;
            perTokenDetails.stopLossTracking.takeProfitTriggered = false;
            perTokenDetails.stopLossTracking.buyPrice = currentPrice; // Update buy price for new position
            perTokenDetails.stopLossTracking.highestPrice = currentPrice;
            perTokenDetails.stopLossTracking.lastSellPrice = null;
            
            console.log(`✅ Re-entry successful. New buy price: ${currentPrice}, Re-entry count: ${perTokenDetails.stopLossTracking.reEntryCount}`);
          } else {
            console.log(`❌ Re-entry buy failed for token: ${token_address}`);
          }
        } else {
          console.log(`⏳ Waiting for re-entry: Current price ${currentPrice} < Re-entry price ${reEntryPrice}`);
        }
      }

      // Only check stop loss and take profit if we haven't just re-entered
      if (!wasBought) {
        // Evaluate advanced stop loss
        const stopLossResult = AdvancedStopLossHelper.evaluateStopLossLogic(
          currentPrice,
          buyPrice,
          perTokenDetails.stopLossTracking.highestPrice,
          tslConfig,
          mslConfig,
          logicType
        );

        // Handle stop loss trigger
        if (stopLossResult.isTriggered && !perTokenDetails.stopLossTracking.stopLossTriggered) {
          console.log(`🛑 Stop loss triggered! Current price: ${currentPrice}, Trigger type: ${stopLossResult.triggerType}`);
          console.log(`📊 Stop loss details: TSL Price: ${stopLossResult.tslPrice}, MSL Price: ${stopLossResult.mslPrice}, Effective: ${stopLossResult.effectiveStopPrice}`);
          
          perTokenDetails.stopLossTracking.stopLossTriggered = true;
          perTokenDetails.stopLossTracking.triggerType = stopLossResult.triggerType;
          perTokenDetails.stopLossTracking.lastSellPrice = currentPrice;
          
          // Execute sell order
          const userTokenBalance = await this.raydiumAmmService.connection.getTokenAccountBalance(
            await getAssociatedTokenAddress(
              new PublicKey(token_address),
              new PublicKey(userDetails.adminFundWalletAddress)
            )
          );
          const newAmount = Number(userTokenBalance.value.amount);
          
          console.log(`💰 Token balance before sell: ${newAmount}`);
          
          if (newAmount > 0) {
            await addTokenForFinalSell({
              userDetails: userDetails,
              token_address,
              newAmount,
              transactionId,
              reEntryFlag: true,
            });
            wasSold = true;
            console.log(`✅ Stop loss sell order placed at price ${currentPrice}. Token amount: ${newAmount}`);
          } else {
            console.log(`⚠️ No tokens to sell - balance is 0`);
          }
        }

        // Handle take profit (if not already sold by stop loss)
        if (!wasSold && !perTokenDetails.stopLossTracking.takeProfitTriggered && userDetails.take_profit) {
          const takeProfitConfig = userDetails.take_profit[0];
          if (takeProfitConfig && takeProfitConfig.percentageProfit) {
            const takeProfitPrice = buyPrice * (1 + takeProfitConfig.percentageProfit / 100);
            
            console.log(`📈 Take profit check: Current price: ${currentPrice}, Take profit price: ${takeProfitPrice}, Target %: ${takeProfitConfig.percentageProfit}%`);
            
            if (currentPrice >= takeProfitPrice) {
              console.log(`🎯 Take profit triggered! Current price: ${currentPrice} >= Take profit price: ${takeProfitPrice}`);
              
              perTokenDetails.stopLossTracking.takeProfitTriggered = true;
              perTokenDetails.stopLossTracking.lastSellPrice = currentPrice;
              
              // Execute take profit sell
              const userTokenBalance = await this.raydiumAmmService.connection.getTokenAccountBalance(
                await getAssociatedTokenAddress(
                  new PublicKey(token_address),
                  new PublicKey(userDetails.adminFundWalletAddress)
                )
              );
              const newAmount = Number(userTokenBalance.value.amount);
              
              console.log(`💰 Token balance before take profit sell: ${newAmount}`);
              
              if (newAmount > 0) {
            await addTokenForFinalSell({
              userDetails: userDetails,
              token_address,
              newAmount,
              transactionId,
                  reEntryFlag: true,
            });
            wasSold = true;
                console.log(`✅ Take profit sell order placed at price ${currentPrice}. Token amount: ${newAmount}`);
              } else {
                console.log(`⚠️ No tokens to sell for take profit - balance is 0`);
              }
            }
          }
        }

        // Update tracking data
        perTokenDetails.stopLossTracking.trailingStopPrice = stopLossResult.tslPrice;
        perTokenDetails.stopLossTracking.maxStopPrice = stopLossResult.mslPrice;
      }

      perTokenDetails.stopLossTracking.lastUpdate = new Date();
      await this.redisService.setTokenConfigSettings(transactionId, perTokenDetails);

    } catch (err) {
      console.log("error in token price monitor worker", err);
      return;
    }
  }

  async executeSwapTransaction(userDetails, tokenAddress, amount, reEntryFlag) {
    try {
      console.log(`🔄 Starting sell transaction for token: ${tokenAddress}, amount: ${amount}`);
      
      // Get token decimals and convert amount like the frontend does
      const { decimals } = await this.web3Helper.getTokenDecimal(tokenAddress);
      if (!decimals) {
        console.log(`❌ Could not get decimals for token: ${tokenAddress}`);
        return false;
      }
      
      // Convert amount to the correct decimal format like frontend
      const convertedAmount = amount * Math.pow(10, decimals);
      console.log(`📊 Amount conversion: ${amount} -> ${convertedAmount} (decimals: ${decimals})`);
      
      const input = {
        fromMint: tokenAddress,
        toMint: SOL,
        slippage: userDetails.slippage,
        owner: userDetails.adminFundWalletAddress,
        amount: convertedAmount,
        secretKey: userDetails.sercetKeyFundWalletAddress,
        gasPriorityFee: userDetails.gasPriorityFee,
        reEntryFlag: false,
      };
      
      console.log("📋 Sell transaction input params:", {
        fromMint: input.fromMint,
        toMint: input.toMint,
        slippage: input.slippage,
        owner: input.owner,
        amount: input.amount,
        gasPriorityFee: input.gasPriorityFee,
        reEntryFlag: input.reEntryFlag
      });
      
      const data = await this.raydiumAmmService.getSwapTx({
        input,
        autoBuyEnable: false,
        userId: userDetails.userId,
      });

      console.log("📊 Sell transaction response:", {
        isSuccess: data?.isSuccess,
        hasData: !!data,
        dataKeys: data ? Object.keys(data) : 'no data',
        error: data?.error || 'no error'
      });
      
      const success = !!data?.isSuccess;
      console.log(`🎯 Sell transaction result: ${success ? 'SUCCESS' : 'FAILED'}`);
      
      if (!success) {
        console.log(`❌ Sell transaction failed for token: ${tokenAddress}`);
        console.log(`❌ Error details:`, data?.error || 'Unknown error');
      }
      
      return success;
    } catch (error) {
      console.log("❌ executeSwapTransaction failed with error:", error.message);
      console.log("❌ Full error:", error);
      return false;
    }
  }

  async executeReEntryBuy(userDetails, tokenAddress, amount, transactionId) {
    try {
      console.log(`🔄 Starting re-entry buy for token: ${tokenAddress}`);
      
      // Get current SOL balance to use as re-entry amount
      const solBalance = await this.raydiumAmmService.connection.getBalance(
        new PublicKey(userDetails.adminFundWalletAddress)
      );
      
      // Convert lamports to SOL (1 SOL = 1e9 lamports)
      const solBalanceInSol = solBalance / 1e9;
      
      // Use the remaining SOL balance as re-entry amount
      const reEntryAmount = Math.max(solBalanceInSol * 0.95, 0.001); // Use 95% of balance, minimum 0.001 SOL
      
      console.log(`💰 SOL Balance: ${solBalanceInSol} SOL, Re-entry amount: ${reEntryAmount} SOL`);
      
      const input = {
        fromMint: SOL,
        toMint: tokenAddress,
        slippage: userDetails.slippage,
        owner: userDetails.adminFundWalletAddress,
        amount: reEntryAmount,
        secretKey: userDetails.sercetKeyFundWalletAddress,
        gasPriorityFee: userDetails.gasPriorityFee,
        reEntryFlag: true,
      };
      
      console.log("📋 Re-entry buy input params:", {
        fromMint: input.fromMint,
        toMint: input.toMint,
        slippage: input.slippage,
        owner: input.owner,
        amount: input.amount,
        gasPriorityFee: input.gasPriorityFee
      });
      
      const data = await this.raydiumAmmService.getSwapTx({
        input,
        autoBuyEnable: false,
        userId: userDetails.userId,
      });

      console.log("📊 Re-entry buy response:", {
        isSuccess: data?.isSuccess,
        hasData: !!data,
        dataKeys: data ? Object.keys(data) : 'no data'
      });
      
      const success = !!data?.isSuccess;
      console.log(`🎯 Re-entry buy result: ${success ? 'SUCCESS' : 'FAILED'}`);
      return success;
    } catch (error) {
      console.log("❌ executeReEntryBuy failed with error:", error.message);
      console.log("❌ Full error:", error);
      return false;
    }
  }

  async sellWorker() {
    try {
      console.log("fetch token  event listener for sell");
      await this.processTokensInBatches();
    } catch (error) {
      console.log("error in sell worker", error);
      return "";
    }
  }

  async processTokensInBatches() {
    if (this.isProcessing) {
      console.log("Skipping execution: Previous batch is still running.");
      return;
    }

    this.isProcessing = true; // Mark as processing
    try {
      const getAllTokens = await this.redisService.getAllTokenData();
      console.log("getAllTokens:  ", getAllTokens);
      if (!getAllTokens || getAllTokens.length === 0) {
        console.log("No tokens available for processing.");
        return;
      }

      const batchSize = 5;
      for (let i = 0; i < getAllTokens.length; i++) {
        // const tokenBatch = getAllTokens.slice(i, i + batchSize); // Get a batch of 25 tokens or less
        // console.log(`Processing batch ${i / batchSize + 1}: ${tokenBatch.length} tokens`);

        try {
          // Process all tokens in the batch concurrently
          const token = getAllTokens[i];
          // console.log("token: (sell Worker) ", token);
          const inTransit = await this.redisService.getTokenData(
            token.token_address
          );

          console.log("inTransit: ", inTransit?.inTransit);
          if (inTransit && JSON.parse(inTransit.inTransit) === false) {
            console.log("Token is getting sell making inTransit true");
            await this.redisService.updateTokenInCache(token.token_address, {
              inTransit: true,
            });
            await matchRaydiumTokenForSellWorker(token);

            const inTransitData = await this.redisService.getTokenData(
              token.token_address
            );

            // console.log("inTransitData:  ", inTransitData);
            if (inTransitData && inTransitData.inTransit) {
              console.log("Token is not sold, making in Transit false");
              await this.redisService.updateTokenInCache(token.token_address, {
                inTransit: false,
              });
            }
          }
        } catch (err) {
          console.error("Error processing batch:", err);
        }
      }
    } catch (error) {
      console.error("Error processing tokens:", error);
    } finally {
      this.isProcessing = false;
    }
  }
}

module.exports = new Trade();
