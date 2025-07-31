const log4js = require("log4js");
const App = require("./app/app");
const logConfig = require("./configs/logConfig");
const { initDiscordBot } = require("./job/worker/discord.worker");
const start = async () => {
  log4js.configure(logConfig);
  const app = new App();
  app.listen();
  app.connectToDatabase();
  await initDiscordBot();
};
// Binanc

start();
