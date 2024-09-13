const { v4: uuidv4 } = require('uuid');
const { PasswordResetRepository, AuditLogRepository } = require('../database');
const PasswordReset = require('../database/password.reset.model');
const EmailService = require('./email.service');
const { HttpError } = require('../middleware');

class PasswordResetService {

  async sendPasswordResetEmail(user, serverAddress) {
    const resetKey = uuidv4();

    await PasswordResetRepository.savePasswordReset(new PasswordReset(
      null, user.id, resetKey, null
    ));
    await AuditLogRepository.saveFunctionAuditLog(user.id, "Password reset sent");

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

  async getByTokenAndDelete(token) {
    const passwordReset = await PasswordResetRepository.getByToken(token);
    if (!passwordReset) {
      throw new HttpError("Invalid token", 401);
    }

    await PasswordResetRepository.deletePasswordResetByToken(token);
    
    return passwordReset;
  }

  async isValidToken(token) {
    return (await PasswordResetRepository.getByToken(token)) != null;
  }
}

module.exports = new PasswordResetService();