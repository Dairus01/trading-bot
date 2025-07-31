const logger = require("log4js").getLogger("auth_services");
const { HttpException } = require("../error/HttpException.js");
const jwt = require("jsonwebtoken");
const errorType = require("../error/errorcodes.js");
const {
  JWT_EXPIRES_IN,
  JWT_SECRET,
  SALTROUND,
} = require("../../configs/env.js");
const UserModel = require("../model/user.model.js");
const SolanaWeb3Helper = require("../utils/solanaWeb3.helper.js");

class AuthService {
  constructor() {
    this.solanaWeb3 = new SolanaWeb3Helper();
    this.JWT_EXPIRES_IN = JWT_EXPIRES_IN;
    this.JWT_SECRET = JWT_SECRET;
    this.saltRounds = SALTROUND;
    this.solanaWeb3Helper = new SolanaWeb3Helper();
  }

  async createNewJwt(user_id) {
    logger.debug(
      `generateJwtForUser is called for user: ${user_id} with expire_in: ${JWT_EXPIRES_IN}`
    );
    const jwtToken = jwt.sign({ id: user_id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    return jwtToken;
  }

  async logIn(object) {
    const { publicKey, signature } = object;
    const user = await UserModel.findOne({
      walletAddress: publicKey,
    });
    if (!user) {
      throw new HttpException(
        errorType.NOT_FOUND.status,
        errorType.NOT_FOUND.message
      );
    }
    const verified = this.solanaWeb3.verfiyPublicAddressForSignature(
      publicKey,
      signature
    );
    if (!verified) {
      throw new HttpException(
        errorType.UNAUTHORIZED.status,
        errorType.UNAUTHORIZED.message
      );
    }

    if (!user) {
      const newUser = await Users({
        walletAddress: publicKey,
      });

      user = await newUser.save();
      logger.info(`New user registered, with wallet addresss ${publicKey}`);
    }
    let jwt_token = await this.createNewJwt(user._id);
    return { user, jwt_token };
  }
}

module.exports = AuthService;
