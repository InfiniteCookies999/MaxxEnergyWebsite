const nodemailer = require('nodemailer');
const config = require('../config');

class EmailService {
  
  initialize() {
    if (!config.EMAIL_SERVICE) {
      throw new Error("Must include EMAIL_SERVICE in your .env file");
    }

    if (!config.EMAIL_ADDRESS) {
      throw new Error("Must include EMAIL_ADDRESS in your .env file");
    }

    if (!config.EMAIL_PASSWORD) {
      throw new Error("Must include EMAIL_PASSWORD in your .env file");
    }

    this.transporter = nodemailer.createTransport({
      service: config.EMAIL_SERVICE,
      auth: {
        user: config.EMAIL_ADDRESS,
        pass: config.EMAIL_PASSWORD
      }
    });
  }

  send(options) {
    const sendOptions = {
      from: config.EMAIL_ADDRESS,
      to: options.to,
      subject: options.subject,
      html: options.body
    };

    this.transporter.sendMail(sendOptions, (err, info) => {
      if (err) {
        throw new Error(`Error sending email: ${err.message}`);
      }
      console.log("email send: " + info.response);
    });
  }
}

module.exports = new EmailService();