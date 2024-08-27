const { v4: uuidv4 } = require('uuid');
const EmailService = require('./email.service');
const { EmailVerifyRepository, EmailVerify } = require('../database');

class EmailVerifyService {

  async sendVerificationEmail(user, serverAddress) {
    const verifyKey = uuidv4();

    await EmailVerifyRepository.saveEmailVerify(new EmailVerify(
      null, user.id, verifyKey, null
    ));

    EmailService.sendHbs({
      to: user.email,
      subject: "Verfy your Maxx Energy account",
      hbsFile: "emailverify",
      context: {
        name: user.firstName + " " + user.lastName,
        maxxLogoPath: "http://" + serverAddress + "/images/maxx-logo.png",
        verifyLink: "http://" + serverAddress + `/verify/${verifyKey}`
      }
    });
  }
}

module.exports = new EmailVerifyService();