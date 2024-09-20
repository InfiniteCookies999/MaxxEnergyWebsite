const { BannedRepository } = require("../database");

class BannedService {
  
  async initialize() {
    this.bannedIps = await BannedRepository.getBannedIps();
  }

  getBannedIps() {
    return this.bannedIps;
  }
};

module.exports = new BannedService();