// Usage: node encrypt_and_update_secret.js <walletAddress> <base58SecretKey>
const mongoose = require('mongoose');
const cryptography = require('../utils/cryptography');
const User = require('../model/user.model');
const { MONGODB_URI } = require('../../configs/env');

async function encryptAndUpdate(walletAddress, base58SecretKey) {
  await mongoose.connect(MONGODB_URI);
  const user = await User.findOne({ walletAddress });
  if (!user) {
    console.error('User not found');
    process.exit(1);
  }
  const before = user.sercetKeyFundWalletAddress;
  console.log('Before (encrypted):', before);
  const encrypted = await cryptography.encrypt(base58SecretKey);
  user.sercetKeyFundWalletAddress = encrypted;
  await user.save();
  console.log('After (encrypted):', encrypted);
  console.log('User secret key updated and encrypted.');
  mongoose.disconnect();
}

const [,, walletAddress, base58SecretKey] = process.argv;
if (!walletAddress || !base58SecretKey) {
  console.error('Usage: node encrypt_and_update_secret.js <walletAddress> <base58SecretKey>');
  process.exit(1);
}
encryptAndUpdate(walletAddress, base58SecretKey); 