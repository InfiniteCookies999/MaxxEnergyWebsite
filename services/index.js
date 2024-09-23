const UserService = require('./user.service');
const FileService = require('./file.service');
const EmailService = require('./email.service');
const EmailVerifyService = require('./email.verify.service');
const PasswordResetService = require('./password.reset.service');
const ContactService = require('./contact.service');
const BannedService = require('./banned.service');

module.exports = {
  UserService,
  FileService,
  EmailService,
  EmailVerifyService,
  PasswordResetService,
  ContactService,
  BannedService
}