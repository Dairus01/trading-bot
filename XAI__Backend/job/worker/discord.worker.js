// discord.service.js

const logger = require("log4js").getLogger("discord-service");
const { Client, GatewayIntentBits, Status } = require("discord.js");
const { PublicKey } = require("@solana/web3.js");
const { addTokenForAutoBuy } = require("../add_task");
const {
  DISCORD_CHANNEL_ID,
  DISCORD_BOT_TOKEN,
  SOL,
} = require("../../configs/env");
const raydium_helper = require("../../app/raydiumServices/raydium_helper");
const RaydiumHelper = new raydium_helper();
const scrappedTokenModel = require("../../app/model/scrappedToken.model");
function isValidSolanaAddress(address) {
  try {
    new PublicKey(address);
    return true;
  } catch (e) {
    return false;
  }
}

let client = null;

// This function will set up the bot *once* if not already set up
async function initDiscordBot() {
  if (client) {
    logger.info("Discord bot already initialized—skipping re-init");
    return;
  }

  client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  const solanaPubkeyRegex = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;

  client.once("ready", () => {
    logger.info(`Logged into Discord as ${client.user.tag}`);
  });

  client.on("messageCreate", async (message) => {
    // Check channel
    console.log("message:  ", message.content);
    if (message.channelId.toString() !== DISCORD_CHANNEL_ID.toString()) return;

    const matches = message.content.match(solanaPubkeyRegex);
    console.log("matches:  ", matches);
    if (!matches) return;

    const validAddresses = matches.filter(isValidSolanaAddress);
    if (validAddresses.length > 0) {
      logger.info(
        `Found possible Solana addresses in Discord message: ${validAddresses}`
      );
      for (const tokenAddress of validAddresses) {
        console.log("tokenAddress:  ", tokenAddress);
        let poolAddress = await RaydiumHelper.findPoolAddressForMintAddress(
          tokenAddress,
          SOL
        );
        if (!poolAddress) {
          poolAddress = await RaydiumHelper.findPoolAddressForMintAddress(
            SOL,
            tokenAddress
          );
        }
        console.log("poolAddress: ", poolAddress);
        let data;

        if (poolAddress) {
          logger.info(
            `Found Raydium pool address for ${tokenAddress}: ${poolAddress}`
          );
          data = {
            tokenAddress: tokenAddress,
            poolId: poolAddress,
            status: "success",
            platform: "discord",
          };

          const newRaydiumPoolDummy = {
            poolId: poolAddress,
            baseMint: SOL,
            quoteMint: tokenAddress,
            autoBuyEnable: true,
          };

          await scrappedTokenModel.findOneAndUpdate(
            { tokenAddress: tokenAddress, platform: "discord" }, // filter
            {
              tokenAddress: tokenAddress,
              poolId: poolAddress,
              status: "success",
              platform: "discord",
            }, // update data
            {
              upsert: true,
              new: true, // return the updated or created document
              setDefaultsOnInsert: true,
            }
          );

          await addTokenForAutoBuy(newRaydiumPoolDummy);
        } else {
          logger.info(
            `No Raydium SOL pair found for token address ${tokenAddress}.`
          );
          data = {
            tokenAddress: tokenAddress,
            poolId: null,
            status: "Failed",
            platform: "discord",
          };
          await scrappedTokenModel.create(data);
        }
      }
    }
  });

  await client
    .login(DISCORD_BOT_TOKEN)
    .then(() => logger.info("Discord bot login successful"))
    .catch((err) => logger.error("Discord bot login failed:", err));
}

module.exports = {
  initDiscordBot,
};
