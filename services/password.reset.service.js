const { v4: uuidv4 } = require('uuid');
const { PasswordResetRepository } = require('../database');
const PasswordReset = require('../database/password.reset.model');
const EmailService = require('./email.service');
const { HttpError } = require('../middleware');

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

  async getUserByTokenAndDelete(token) {
    const user = await PasswordResetRepository.getUserByToken(token);
    if (!user) {
      throw new HttpError("Invalid token", 401);
    }

    await PasswordResetRepository.deletePasswordResetByToken(token);
  }
}

module.exports = new PasswordResetService();