// Usage: node fix_atlas_secret.js <base58SecretKey>
const mongoose = require('mongoose');
const cryptography = require('../utils/cryptography');
const User = require('../model/user.model');

// MongoDB Atlas connection string - replace with your actual Atlas URI
const MONGODB_URI = 'mongodb+srv://tradingbot:Patricia%40123@cluster0.fo7jd0a.mongodb.net/patricia_bot?retryWrites=true&w=majority&appName=Cluster0';

async function fixAtlasSecret(base58SecretKey) {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    const user = await User.findOne({ walletAddress: 'FeocjG4NqJNdbXavMij8zvJMSbq5WBvsTDM96PpXSXd8' });
    if (!user) {
      console.error('❌ User not found with wallet address: FeocjG4NqJNdbXavMij8zvJMSbq5WBvsTDM96PpXSXd8');
      process.exit(1);
    }

    console.log('👤 Found user:', user._id);
    console.log('🔐 Before (encrypted):', user.sercetKeyFundWalletAddress);

    console.log('🔒 Encrypting secret key...');
    const encrypted = await cryptography.encrypt(base58SecretKey);
    
    console.log('💾 Updating user in Atlas...');
    user.sercetKeyFundWalletAddress = encrypted;
    await user.save();
    
    console.log('✅ After (encrypted):', encrypted);
    console.log('🎉 User secret key updated and encrypted in MongoDB Atlas!');
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

const [, , base58SecretKey] = process.argv;
if (!base58SecretKey) {
  console.error('❌ Usage: node fix_atlas_secret.js <base58SecretKey>');
  console.error('Example: node fix_atlas_secret.js 4xQyPqKjzH8mN2vX7cF1wE9rT6yU3iO5pL8sA4dG7hJ0kZ...');
  process.exit(1);
}

fixAtlasSecret(base58SecretKey); 