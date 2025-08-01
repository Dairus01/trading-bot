// Usage: node create_atlas_user.js <base58SecretKey>
const mongoose = require('mongoose');
const cryptography = require('../utils/cryptography');
const User = require('../model/user.model');

// MongoDB Atlas connection string
const MONGODB_URI = 'mongodb+srv://tradingbot:Patricia%40123@cluster0.fo7jd0a.mongodb.net/patricia_bot?retryWrites=true&w=majority&appName=Cluster0';

async function createAtlasUser(base58SecretKey) {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Check if user already exists
    let user = await User.findOne({ walletAddress: 'FeocjG4NqJNdbXavMij8zvJMSbq5WBvsTDM96PpXSXd8' });
    
    if (user) {
      console.log('👤 User already exists, updating secret key...');
    } else {
      console.log('👤 Creating new user...');
             user = new User({
         walletAddress: 'FeocjG4NqJNdbXavMij8zvJMSbq5WBvsTDM96PpXSXd8',
         adminFundWalletAddress: 'FeocjG4NqJNdbXavMij8zvJMSbq5WBvsTDM96PpXSXd8',
         withdrawWalletAddress: 'FeocjG4NqJNdbXavMij8zvJMSbq5WBvsTDM96PpXSXd8',
         // Add other required fields with default values
         autoBuyEnable: false,
         autoSellEnable: false,
                   stop_loss: { percentage: 0, sellPercentage: 1 },
          take_profit: { percentage: 0, sellPercentage: 1 },
         slippage: 1,
         gasPriorityFee: 0,
         minimumLiquidity: 0,
         numberOfWorker: 1,
         advancedStopLoss: {
           trailingStopLoss: { enabled: false, percentage: 0.5 },
           maxStopLoss: { enabled: false, percentage: 1 },
           stopLossLogic: 'TSL_MSL_COMBINED',
           reEntrySettings: { enabled: false, offsetPercentage: 1, maxReEntries: 100, currentReEntries: 0 }
         }
       });
    }

    console.log('🔐 Before (encrypted):', user.sercetKeyFundWalletAddress);

    console.log('🔒 Encrypting secret key...');
    const encrypted = await cryptography.encrypt(base58SecretKey);
    
    console.log('💾 Saving user to Atlas...');
    user.sercetKeyFundWalletAddress = encrypted;
    await user.save();
    
    console.log('✅ After (encrypted):', encrypted);
    console.log('🎉 User created/updated in MongoDB Atlas!');
    console.log('👤 User ID:', user._id);
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

const [, , base58SecretKey] = process.argv;
if (!base58SecretKey) {
  console.error('❌ Usage: node create_atlas_user.js <base58SecretKey>');
  console.error('Example: node create_atlas_user.js 4xQyPqKjzH8mN2vX7cF1wE9rT6yU3iO5pL8sA4dG7hJ0kZ...');
  process.exit(1);
}

createAtlasUser(base58SecretKey); 