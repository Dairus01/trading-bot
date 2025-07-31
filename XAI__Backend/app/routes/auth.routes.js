const { Router } = require("express");
const AuthController = require("../controllers/auth.controller");

class AuthRoutes {
  constructor() {
    this.path = "/api/v1/auth/";
    this.router = Router();
    this.authController = new AuthController();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      `${this.path}login`,
      this.authController.login.bind(this.authController)
    );
  }
}

module.exports = AuthRoutes;
