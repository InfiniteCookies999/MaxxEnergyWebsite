const getDBConnection = require('./connection');
const UserRepository = require('./user.repository');
const User = require('./user.model');
const EmailVerifyRepository = require('./email.verify.repository');
const EmailVerify = require('./email.verify.model');
const PasswordResetRepository = require('./password.reset.repository');
const PassswordReset = require('./password.reset.model');
const { ContactRepository, ContactMessage } = require('./contact.repository');

module.exports = {
  getDBConnection,
  UserRepository,
  User,
  EmailVerifyRepository,
  EmailVerify,
  PasswordResetRepository,
  PassswordReset,
  ContactRepository,
  ContactMessage
}