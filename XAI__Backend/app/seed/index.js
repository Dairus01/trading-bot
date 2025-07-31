// const logger = require("log4js").getLogger("seed module");
// const base58 = require("bs58");
// const { Keypair } = require("@solana/web3.js");
// const cryptography = require("../utils/cryptography");
// const { walletAddress } = require("../../configs/env");
// const User = require("../model/user.model");
// module.exports = {
//   async seedAddresses() {
//     try {
//       const keypair = Keypair.generate();
//       const publicKey = keypair.publicKey.toBase58();
//       const secretKey = base58.encode(keypair.secretKey);
//       const encryptedSecretKey = await cryptography.encrypt(secretKey);
//       if (!encryptedSecretKey) {
//         throw new Error("Failed to encrypt the secret key.");
//       }
//       const data = await User.create({
//         walletAddress: walletAddress,
//         seedWalletAddress: publicKey,
//         seedWalletSecretkey: encryptedSecretKey,
//       });
//       await data.save();
//       logger.info(`New user seeded, with wallet addresss ${walletAddress}.`);
//     } catch (error) {
//       logger.error(`error when seed wallet address ${error.message}`);
//     }
//   },
// };

const logger = require("log4js").getLogger("seed module");
const base58 = require("bs58");
const { Keypair } = require("@solana/web3.js");
const cryptography = require("../utils/cryptography");
const { walletAddress, withdrawWalletAddress } = require("../../configs/env");
const User = require("../model/user.model");

module.exports = {
  async seedAddresses() {
    try {
      // 1. Check if user already exists
      const existingUser = await User.findOne({ walletAddress: walletAddress });

      // 2. If user is found, log and return
      if (existingUser) {
        logger.info(
          `User with wallet address ${walletAddress} already exists. Skipping seeding.`
        );
        return;
      }
      

      // 3. Otherwise, proceed to create new user
      const keypair = Keypair.generate();
      const publicKey = keypair.publicKey.toBase58();
      const secretKey = base58.encode(keypair.secretKey);

      const encryptedSecretKey = await cryptography.encrypt(secretKey);
      if (!encryptedSecretKey) {
        throw new Error("Failed to encrypt the secret key.");
      }

      const data = new User({
        walletAddress: walletAddress,
        adminFundWalletAddress: publicKey,
        sercetKeyFundWalletAddress: encryptedSecretKey,
        withdrawWalletAddress: withdrawWalletAddress,
      });

      await data.save();
      logger.info(`New user seeded with wallet address ${walletAddress}.`);
    } catch (error) {
      logger.error(`error when seed wallet address ${error.message}`);
    }
  },
};
