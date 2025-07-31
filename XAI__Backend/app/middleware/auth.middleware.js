const { HttpException } = require("../error/HttpException.js");
const errorType = require("../error/errorcodes.js");

const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../../configs/env.js");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      throw new HttpException(
        errorType.UNAUTHORIZED.status,
        "Access denied. No token provided."
      );
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token. Access denied.",
    });
  }
};

module.exports = authMiddleware;
