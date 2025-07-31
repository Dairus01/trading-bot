const { Connection, PublicKey } = require("@solana/web3.js");
const { getMint } = require("@solana/spl-token");
const RaydiumAmmServiceV2 = require("../raydiumServices/raydium_helper");
const { SOL, SOL_RPC } = require("../../configs/env");

class BuyCondition {
  constructor() {
    this.connection = new Connection(SOL_RPC, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });
    this.raydiumServiceV2 = new RaydiumAmmServiceV2();
  }

  async checkLpBurn(payer, poolId) {
    const lpMint = await this.raydiumServiceV2.getPoolInfo(payer, poolId);
    const mintInfo = await this.connection.getParsedAccountInfo(lpMint);
    const totalSupply = mintInfo.value.data.parsed.info.supply;
    return totalSupply === 0;
  }

  async OwnershipRenouncedCheck(mintAddress) {
    const mintPublicKey = new PublicKey(mintAddress);
    const mintInfo = await getMint(this.connection, mintPublicKey);
    const mintAuthorityRevoked = mintInfo.mintAuthority === null;
    return mintAuthorityRevoked;
  }

  async FreezAuthorityRevoked(mintAddress) {
    const mintPublicKey = new PublicKey(mintAddress);
    const mintInfo = await getMint(this.connection, mintPublicKey);
    const mintAuthorityRevoked = mintInfo.freezeAuthority === null;
    return mintAuthorityRevoked;
  }
}
module.exports = BuyCondition;
