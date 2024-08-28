const { v4: uuidv4 } = require('uuid');
const EmailService = require('./email.service');
const { EmailVerifyRepository, EmailVerify } = require('../database');
const { HttpError } = require('../middleware');

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
        maxxLogoCID: "logo@image",
        verifyLink: "http://" + serverAddress + `/verify-email/${verifyKey}`
      },
      attachments: [{
        filename: "maxx-logo.png",
        path: "public/images/maxx-logo.png",
        cid: "logo@image"
      }]
    });
  }

  async verifyEmail(token) {
    // TODO: Drop the table entry!
    const emailVerify = await EmailVerifyRepository.getEmailVerifyByVerifyKey(token);
    if (!emailVerify) {
      throw new HttpError("Invalid email token", 401);
    }
    return emailVerify.userId;
  }
}

module.exports = new EmailVerifyService();