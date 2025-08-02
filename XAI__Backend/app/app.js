const logger = require("log4js").getLogger("app module");
const express = require("express");
const cors = require("cors");
const { PORT } = require("../configs/env");
const routes = require("../app/routes/index");
const mongoose = require("mongoose");
const { MONGODB_URI } = require("../configs/env");
const { seedAddresses } = require("./seed/index");
const { errorMiddleware } = require("../app/middleware/error.middleware");
const { startWorkers } = require("../job/process_worker");
const { bullQueueSchedulers } = require("../job/add_task");
const redisClean = require("../app/cron/clear.redis");
const Cron = require("../app/cron/redis.cron");
const serverAdapter = require("../job/utils/queue.helper").getServerAdapter();
// Only set up Bull Board if serverAdapter exists (disabled for Vercel)
if (serverAdapter) {
  serverAdapter.setBasePath("/admin/queues");
}
// Don't initialize Raydium listener immediately - it will be started by workers when needed

class App {
  constructor() {
    this.app = express();
    this.PORT = PORT;
    this.routes = routes;
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
    seedAddresses();
    startWorkers();
    bullQueueSchedulers();
    Cron();
    // redisClean();
  }

  listen() {
    this.app.listen(this.PORT, () => {
      logger.info(`Server running on port ${this.PORT}`);
    });
  }

  connectToDatabase(connectionString = MONGODB_URI) {
    mongoose.set("strictQuery", true);
    mongoose.connect(connectionString).then(() => {
      logger.info(" 🚀 Connected to MongoDB...");
    });

    mongoose.connection.on("connected", () => {
      logger.info("🚀 Mongo database connected");
    });

    mongoose.connection.on("error", (err) => {
      logger.error(err.message, err);
    });

    mongoose.connection.on("disconnected", () => {
      logger.error(" 🚀 Mongoose default connection is disconnected");
    });

    process.on("SIGINT", () => {
      mongoose.connection.close(() => {
        logger.error(
          "🚀 Mongoose default connection is disconnected, due to application termination"
        );
        process.exit(0);
      });
    });
  }

  initializeMiddlewares() {
    this.app.use(cors({ origin: "*" }));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // Only add Bull Board routes if serverAdapter exists (disabled for Vercel)
    if (serverAdapter) {
      this.app.use("/admin/queues", serverAdapter.getRouter());
    }
    
    // Health check endpoint for Vercel
    this.app.get("/health", (req, res) => {
      res.status(200).json({
        status: "ok",
        message: "Server is running",
        timestamp: new Date().toISOString()
      });
    });
  }
  initializeRoutes() {
    this.routes.forEach((route) => {
      this.app.use("/", route.router);
    });
  }

  initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }
}

module.exports = App;
