const crypto = require("crypto");

class Cryptography {
  constructor() {
    this.algorithm = "aes-192-cbc";
    this.password = "2001MyForever";
    this.salt = "salt";
    this.ivLength = 16;
  }

  async encrypt(message) {
    const key = crypto.scryptSync(this.password, this.salt, 24);
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    let encrypted = cipher.update(message, "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
  }

  async decrypt(encryptedData) {
    const [ivHex, encrypted] = await encryptedData.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const key = crypto.scryptSync(this.password, this.salt, 24);
    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted.toString();
  }
  

}
module.exports = new Cryptography();
