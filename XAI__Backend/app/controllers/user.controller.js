const { HttpException } = require("../error/HttpException");
const errorType = require("../error/errorcodes");
const UserService = require("../services/user.service");
const {
  validateCommonSettings,
  validateDirectBuy,
  validateDirectSell,
  validateWithdrawValue,
  validateDepositValue,
  validateAdvnaceBuy,
  validateAutoSell,
} = require("../validators/user.validator");
class UserController {
  constructor() {
    this.userService = new UserService();
  }

  async directBuy(req, res, next) {
    try {
      const { error } = validateDirectBuy(req.body);
      if (error) {
        throw new HttpException(
          errorType.BAD_REQUEST.status,
          errorType.BAD_REQUEST.message
        );
      }
      const data = await this.userService.directBuyService({
        id: req.user.id,
        inputValue: req.body,
      });
      if (data.isSuccess === false) {
        return res.status(400).json({
          success: false,
          message: data?.error || 'Direct purchase failed',
        });
      }
      res.status(200).json({
        success: true,
        data,
        message: "direct Purchase successful",
      });
    } catch (error) {
      next(error);
    }
  }

  async advanceBuy(req, res, next) {
    try {
      const { error } = validateAdvnaceBuy(req.body);
      if (error) {
        console.log("error", error);
        throw new HttpException(
          errorType.BAD_REQUEST.status,
          errorType.BAD_REQUEST.message
        );
      }
      const data = await this.userService.advanceBuyService({
        id: req.user.id,
        inputValue: req.body,
      });
      res.status(200).json({
        success: true,
        data,
        message: "advance buy/sell condition set  successful",
      });
    } catch (error) {
      next(error);
    }
  }

  async getSecretKey(req, res, next) {
    try {
      const data = await this.userService.getSecretKey({
        id: req.user.id,
      });
      res.status(200).json({
        success: true,
        data,
        message: "this is getSetCriteria details",
      });
    } catch (error) {
      next(error);
    }
  }

  async getSetCriteria(req, res, next) {
    try {
      // console.log(req.user);
      const data = await this.userService.getSetCriteriaService({
        id: req.user.id,
      });
      res.status(200).json({
        success: true,
        data,
        message: "this is getSetCriteria details",
      });
    } catch (error) {
      next(error);
    }
  }

  async getTokenHolding(req, res, next) {
    try {
      let { skip, limit } = req.query;
      skip = parseInt(skip) || 0;
      limit = parseInt(limit) || 10;

      // Fetch paginated data and total count
      const { data, totalCount } = await this.userService.getTokenHolding({
        id: req.user.id,
        skip,
        limit,
      });

      console.log("data:  ", data);

      // Calculate total pages
      const totalPages = Math.ceil(totalCount / limit);
      const currentPage = Math.floor(skip / limit) + 1;

      return res.status(200).json({
        success: true,
        data,
        pagination: {
          totalRecords: totalCount,
          totalPages,
          currentPage,
          limit,
        },
        message: "Token details retrieved successfully",
      });
    } catch (err) {
      next(err);
    }
  }

  async withdraw(req, res, next) {
    try {
      const { error } = validateWithdrawValue(req.body);
      if (error) {
        throw new HttpException(
          errorType.BAD_REQUEST.status,
          errorType.BAD_REQUEST.message
        );
      }
      const data = await this.userService.withdrawSol(req.user.id, req.body);
      res.status(200).json({
        data,
        message: "Withdraw transactions successfull",
      });
    } catch (error) {
      next(error);
    }
  }
  async deposit(req, res, next) {
    try {
      const { error } = validateDepositValue(req.body);

      if (error) {
        throw new HttpException(
          errorType.BAD_REQUEST.status,
          errorType.BAD_REQUEST.message
        );
      }

      const data = await this.userService.depositSol({
        id: req.user.id,
        inputValue: req.body,
      });
      res.status(200).json({
        data,
        message: "this is deposite transactions",
      });
    } catch (error) {
      next(error);
    }
  }

  async directSell(req, res, next) {
    try {
      try {
        const { error } = validateDirectSell(req.body);
        if (error) {
          console.log("error: ", error);
          throw new HttpException(
            errorType.BAD_REQUEST.status,
            errorType.BAD_REQUEST.message
          );
        }

        const data = await this.userService.directSellService({
          id: req.user.id,
          inputValue: req.body,
        });

        if (data.isSuccess === false) {
          res.status(400).json({
            success: false,
            message: "direct sell failed",
          });
        } else {
          res.status(200).json({
            success: true,
            data,
            message: "direct sell successful",
          });
        }
      } catch (error) {
        next(error);
      }
    } catch (error) {
      next(error);
    }
  }

  async advanceSell(req, res, next) {
    try {
      const { error } = validateAutoSell(req.body);
      if (error) {
        throw new HttpException(
          errorType.BAD_REQUEST.status,
          error.details[0].message
        );
      }
      const data = await this.userService.advanceSellService({
        id: req.user.id,
        inputValue: req.body,
      });
      res.status(200).json({
        success: true,
        data: data,
        message: "criterion set for AutoSell successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async transactionSettings(req, res, next) {
    try {
      const { error } = validateCommonSettings(req.body);
      if (error) {
        throw new HttpException(
          errorType.BAD_REQUEST.status,
          errorType.BAD_REQUEST.message
        );
      }
      const data = await this.userService.transactionSettingService({
        id: req.user.id,
        inputValue: req.body,
      });
      res.status(200).json({
        success: true,
        data,
        message: "gas fee and slippage set successfully",
      });
    } catch (error) {
      next(error);
    }
  }
  async fundWalletBalance(req, res, next) {
    try {
      const data = await this.userService.fundWalletBalanceService({
        id: req.user.id,
      });
      res.status(200).json({
        success: true,
        data,
        message: "funded wallet balance ",
      });
    } catch (error) {
      next(error);
    }
  }

  async purchaseTable(req, res, next) {
    try {
      let { skip, limit } = req.query;
      skip = parseInt(skip) || 0;
      limit = parseInt(limit) || 10;

      // Fetch paginated data and total count
      const { data, totalCount } = await this.userService.purchaseTableService({
        id: req.user.id,
        skip,
        limit,
      });

      // Calculate total pages
      const totalPages = Math.ceil(totalCount / limit);
      const currentPage = Math.floor(skip / limit) + 1;

      return res.status(200).json({
        success: true,
        data,
        pagination: {
          totalRecords: totalCount,
          totalPages,
          currentPage,
          limit,
        },
        message: "Purchase details retrieved successfully",
      });
    } catch (err) {
      next(err);
    }
  }

  async transactionHistory(req, res, next) {
    try {
      let { skip, limit } = req.query;
      skip = parseInt(skip) || 0;
      limit = parseInt(limit) || 10;
      const { data, totalCount } =
        await this.userService.transactionHistoryService({
          id: req.user.id,
          skip,
          limit,
        });
      const totalPages = Math.ceil(totalCount / limit);
      const currentPage = Math.floor(skip / limit) + 1;

      return res.status(200).json({
        success: true,
        data,
        pagination: {
          totalRecords: totalCount,
          totalPages,
          currentPage,
          limit,
        },
        message: "Purchase details retrieved successfully",
      });
    } catch (err) {
      next(err);
    }
  }

  async getAllActiveSells(req, res, next) {
    try {
      const data = await this.userService.getAllActiveSellsService({
        id: req.user.id,
      });
      res.status(200).json({
        success: true,
        data,
        message: "All active sells retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async stopAndStartAutoSell(req, res, next) {
    try {
      const data = await this.userService.stopAndStartAutoSellService({
        id: req.user.id,
        transactionId: req.body.transactionId,
        autoSellenable: req.body.autoSellenable,
      });
      res.status(200).json({
        success: true,
        data,
        message: "AutoSell stopped and started successfully",
      });
    } catch (error) {
      next(error);
    }
  }
  async stopAndStartAutoBuy(req, res, next) {
    try {
      const data = await this.userService.stopAndStartAutoBuyService({
        id: req.user.id,
        autoBuyEnable: req.body.autoBuyEnable,
      });
      res.status(200).json({
        success: true,
        data,
        message: "AutoBuy stopped and started successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getScrappedToken(req, res, next) {
    try {
      let { skip, limit, type } = req.query;
      skip = parseInt(skip) || 0;
      limit = parseInt(limit) || 10;
      if (!type) throw new Error("Platform type is required");

      const { data, totalCount } =
        await this.userService.getScrappedTokenService({
          skip,
          limit,
          type,
        });
      const totalPages = Math.ceil(totalCount / limit);
      const currentPage = Math.floor(skip / limit) + 1;

      return res.status(200).json({
        success: true,
        data,
        pagination: {
          totalRecords: totalCount,
          totalPages,
          currentPage,
          limit,
        },
        message: "Scrapped Token details retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
