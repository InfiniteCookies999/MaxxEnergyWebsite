const nodemailer = require('nodemailer');
const path = require('path');
const config = require('../config');
const hbs = require('nodemailer-express-handlebars');

class EmailService {
  
  async initialize() {
    if (!config.EMAIL_SERVICE) {
      throw new Error("Must include EMAIL_SERVICE in your .env file");
    }

    if (!config.EMAIL_ADDRESS) {
      throw new Error("Must include EMAIL_ADDRESS in your .env file");
    }

    if (!config.EMAIL_PASSWORD) {
      throw new Error("Must include EMAIL_PASSWORD in your .env file");
    }

    const authOptions = {
      service: config.EMAIL_SERVICE,
      auth: {
        user: config.EMAIL_ADDRESS,
        pass: config.EMAIL_PASSWORD
      }
    };

    this.hbsTransporter = nodemailer.createTransport(authOptions);
    this.transporter = nodemailer.createTransport(authOptions);

    this.hbsTransporter.use('compile', hbs({
      viewEngine: {
        extName: '.hbs',
        defaultLayout: false,
      },
      viewPath: path.resolve('./public'),
      extName: '.hbs',
    }));
  }

  sendHbs(options) {
    const sendOptions = {
      from: config.EMAIL_ADDRESS,
      to: options.to,
      subject: options.subject,
      template: options.hbsFile,
      context: options.context,
      attachments: options.attachments
    };

    this.hbsTransporter.sendMail(sendOptions, (err, info) => {
      if (err) {
        throw new Error(`Error sending email: ${err.message}`);
      }
      console.log("email send: " + info.response);
    });
  }

  send(options) {
    const sendOptions = {
      from: config.EMAIL_ADDRESS,
      to: options.to,
      subject: options.subject,
      text: options.text,
      attachments: options.attachments
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