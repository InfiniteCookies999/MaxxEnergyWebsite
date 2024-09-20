const { BannedRepository } = require("../database");

class BannedService {
  
  async initialize() {
    this.bannedIps = await BannedRepository.getBannedIps();
  }

  getBannedIps() {
    return this.bannedIps;
  }

  async deleteBan(banId) {
    await BannedRepository.deleteBanById(banId);
    
    this.bannedIps = await BannedRepository.getBannedIps();
  }
};

module.exports = new BannedService();