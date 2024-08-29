const { v4: uuidv4 } = require('uuid');
const { PasswordResetRepository } = require('../database');
const PasswordReset = require('../database/password.reset.model');
const EmailService = require('./email.service');

class PasswordResetService {

  async sendPasswordResetEmail(user, serverAddress) {
    const resetKey = uuidv4();

    await PasswordResetRepository.savePasswordReset(new PasswordReset(
      null, user.id, resetKey, null
    ));

    EmailService.sendHbs({
      to: user.email,
      subject: "Password Reset",
      hbsFile: "passreset",
      context: {
        name: user.firstName + " " + user.lastName,
        maxxLogoCID: "logo@image",
        resetLink: "http://" + serverAddress + `/password-reset/${resetKey}`
      },
      attachments: [{
        filename: "maxx-logo.png",
        path: "public/images/maxx-logo.png",
        cid: "logo@image"
      }]
    });
  }
}

module.exports = new PasswordResetService();