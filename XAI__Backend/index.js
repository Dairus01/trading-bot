const log4js = require("log4js");
const App = require("./app/app");
const logConfig = require("./configs/logConfig");

// Configure logging for Vercel (disable file logging to avoid stack overflow)
const vercelLogConfig = {
  ...logConfig,
  appenders: {
    console: {
      type: 'console',
      layout: {
        type: 'pattern',
        pattern: '%[%d{yyyy-MM-dd hh:mm:ss} %p %c%] %m'
      }
    }
  },
  categories: {
    default: {
      appenders: ['console'],
      level: 'info'
    }
  }
};

log4js.configure(vercelLogConfig);

let app = null;

// Initialize app for Vercel
const initializeApp = async () => {
  if (!app) {
    app = new App();
    await app.connectToDatabase();
  }
  return app;
};

// Vercel serverless function export
module.exports = async (req, res) => {
  try {
    const appInstance = await initializeApp();
    return appInstance.getApp()(req, res);
  } catch (error) {
    console.error('Vercel function error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
