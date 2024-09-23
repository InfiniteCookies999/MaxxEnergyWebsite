const { BannedRepository } = require("../database");

const EMAIL_PATTERN = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

class BannedService {
  
  async initialize() {
    this.bannedIps = await BannedRepository.getBannedIps();
    this.bannedEmails = await BannedRepository.getBannedEmails();
  }

  getBannedIps() {
    return this.bannedIps;
  }

  getBannedEmails() {
    return this.bannedEmails;
  }

  async deleteBan(banId) {
    await BannedRepository.deleteBanById(banId);
    
    this.bannedIps = await BannedRepository.getBannedIps();
    this.bannedEmails = await BannedRepository.getBannedEmails();
  }

  async addBan(banEmailOrIp) {
    if (EMAIL_PATTERN.test(banEmailOrIp)) {
      // banning email
      await BannedRepository.saveEmailBan(banEmailOrIp.toLowerCase());
      this.bannedEmails.push(banEmailOrIp.toLowerCase());
    } else {
      // banning by ip
      await BannedRepository.saveIpBan(banEmailOrIp);
      this.bannedIps.push(banEmailOrIp);
    }
  }
};

module.exports = new BannedService();