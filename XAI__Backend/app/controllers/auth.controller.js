const { HttpException } = require("../error/HttpException");
const errorType = require("../error/errorcodes");
const AuthService = require("../services/auth.service");
const { validateAuthLogin } = require("../validators/auth.validators");
// const BuyCondition = require("../utils/buyConditions");
const RedisService = require("../utils/redis.service");
class AuthController {
  constructor() {
    this.authService = new AuthService();
    // this.buyCondition = new BuyCondition();
    this.redisService = new RedisService();
  }

  async login(req, res, next) {
    try {
      const { error } = validateAuthLogin(req.body);
      if (error) {
        throw new HttpException(
          errorType.BAD_REQUEST.status,
          error.details[0].message
        );
      }
      const data = await this.authService.logIn(req.body);
      const { user, jwt_token } = data;
      res.status(200).json({
          success: true,
          data: {
              user: user,
              jwt_token
          },
          message: 'Login successful'
      });
      //console.log("dddddddddddddddddd",user._id.toString());
      // const updatedFields = { priority: 5 };
      // const data1 = await this.redisService.getUserSettingsFromCache(
      //   user._id.toString()
      // );
      // //const data2 = await this.redisService.removeSoldToken("HD18LwVXixj9uFRgBXviR17xFha3YWrUa5RZvGS6QLzZ");
      // //const data1= await this.redisService.updateTokenInCache("HoWFd49rFQVFcfMbcGe4bj2e1K242r7B79z2o2Yopump",updatedFields);
      // res.status(200).json({
      //   success: true,
      //   data1,
      // });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
