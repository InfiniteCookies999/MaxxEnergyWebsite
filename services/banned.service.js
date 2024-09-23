const { BannedRepository } = require("../database");

const EMAIL_PATTERN = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

class BannedService {
  
  async initialize() {
    this.bannedIps = await BannedRepository.getBannedIps();
    this.bannedEmails = [];
  }

  getBannedIps() {
    return this.bannedIps;
  }

  async deleteBan(banId) {
    await BannedRepository.deleteBanById(banId);
    
    this.bannedIps = await BannedRepository.getBannedIps();
  }

  async addBan(banEmailOrIp) {
    if (EMAIL_PATTERN.test(banEmailOrIp)) {
      // banning email
      await BannedRepository.saveEmailBan(banEmailOrIp);
      this.bannedEmails.push(banEmailOrIp);
    } else {
      // banning by ip
      await BannedRepository.saveIpBan(banEmailOrIp);
      this.bannedIps.push(banEmailOrIp);
    }
  }
};

module.exports = new BannedService();