const Router = require("express");
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");

class UserRoutes {
  constructor() {
    this.path = "/api/v1/admin/";
    this.router = Router();
    this.userController = new userController();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      `${this.path}directBuy`,
      authMiddleware,
      this.userController.directBuy.bind(this.userController)
    );

    this.router.put(
      `${this.path}advanceBuy`,
      authMiddleware,
      this.userController.advanceBuy.bind(this.userController)
    );
    this.router.get(
      `${this.path}fundWalletBalance`,
      authMiddleware,
      this.userController.fundWalletBalance.bind(this.userController)
    );
    this.router.get(
      `${this.path}getTokenHolding`,
      authMiddleware,
      this.userController.getTokenHolding.bind(this.userController)
    );

    this.router.post(
      `${this.path}withdraw`,
      authMiddleware,
      this.userController.withdraw.bind(this.userController)
    );

    this.router.post(
      `${this.path}deposit`,
      authMiddleware,
      this.userController.deposit.bind(this.userController)
    );

    this.router.post(
      `${this.path}directSell`,
      authMiddleware,
      this.userController.directSell.bind(this.userController)
    );

    this.router.put(
      `${this.path}advanceSell`,
      authMiddleware,
      this.userController.advanceSell.bind(this.userController)
    );

    this.router.get(
      `${this.path}getSetCriteria`,
      authMiddleware,
      this.userController.getSetCriteria.bind(this.userController)
    );
    this.router.get(
      `${this.path}getSecretKey`,
      authMiddleware,
      this.userController.getSecretKey.bind(this.userController)
    );

    this.router.post(
      `${this.path}stopAndStartAutoSell`,
      authMiddleware,
      this.userController.stopAndStartAutoSell.bind(this.userController)
    );
    this.router.post(
      `${this.path}stopAndStartAutoBuy`,
      authMiddleware,
      this.userController.stopAndStartAutoBuy.bind(this.userController)
    );

    this.router.post(
      `${this.path}transactionSettings`,
      authMiddleware,
      this.userController.transactionSettings.bind(this.userController)
    );

    this.router.get(
      `${this.path}purchaseTable`,
      authMiddleware,
      this.userController.purchaseTable.bind(this.userController)
    );

    this.router.get(
      `${this.path}transactionHistory`,
      authMiddleware,
      this.userController.transactionHistory.bind(this.userController)
    );

    this.router.get(
      `${this.path}getScrappedToken`,
      authMiddleware,
      this.userController.getScrappedToken.bind(this.userController)
    );
  }
}

module.exports = UserRoutes;
