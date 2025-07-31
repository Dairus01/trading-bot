const mongoose = require('mongoose');
const UserModel = require('./app/model/user.model');
const purchaseModel = require('./app/model/purchase.model');
const RedisService = require('./app/utils/redis.service');
const { MONGODB_URI } = require('./configs/env');

async function migrateExistingTokens() {
  try {
    console.log('🔄 Starting migration of existing tokens...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const redisService = new RedisService();
    
    // Get all users
    const users = await UserModel.find({});
    console.log(`📊 Found ${users.length} users`);
    
    for (const user of users) {
      console.log(`\n👤 Processing user: ${user._id}`);
      
      // Get all purchases for this user
      const purchases = await purchaseModel.find({
        userId: user._id,
        sold: false,
        availableToken: { $gt: 0 }
      });
      
      console.log(`📦 Found ${purchases.length} active purchases for user ${user._id}`);
      
      for (const purchase of purchases) {
        console.log(`🔄 Processing purchase: ${purchase._id} for token: ${purchase.token_address}`);
        
        // Create cache data for this token
        const cacheData = {
          transactionId: purchase._id,
          userId: user._id,
          stop_loss: user.stop_loss || [],
          take_profit: user.take_profit || [],
          minimumLiquidity: user.minimumLiquidity || 0,
          advancedStopLoss: user.advancedStopLoss || {},
          stopLossTracking: {
            buyPrice: purchase.token_price || 0,
            highestPrice: purchase.token_price || 0,
            reEntryCount: 0,
            stopLossTriggered: false,
            takeProfitTriggered: false,
            lastSellPrice: null,
          }
        };
        
        // Store in Redis cache
        await redisService.setTokenConfigSettings(purchase._id, cacheData);
        console.log(`✅ Cached data created for transaction: ${purchase._id}`);
        
        // Also ensure the token is in the main token cache
        const tokenData = {
          userId: user._id,
          signature: purchase.signature,
          trade_type: purchase.trade_type,
          wallet_address: purchase.wallet_address,
          in_amount: purchase.in_amount,
          out_amount: purchase.out_amount,
          availableToken: purchase.availableToken,
          status: purchase.status,
          token_address: purchase.token_address,
          slippage: purchase.slippage,
          gasPriorityFee: purchase.gasPriorityFee,
          token_price: purchase.token_price,
          trade_from: purchase.trade_from,
          sold: purchase.sold,
          priority: 5,
          transactionId: purchase._id,
          timeStamp: purchase.createdAt || new Date(),
          inTransit: false,
        };
        
        await redisService.storeTokenInCaches(purchase.token_address, tokenData);
        console.log(`✅ Token data cached for: ${purchase.token_address}`);
      }
    }
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('📝 All existing tokens now have proper cache data for stop loss tracking.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the migration
migrateExistingTokens(); 