const getDBConnection = require('./connection');
const { UserRepository, User } = require('./user.repository');
const { ContactRepository, ContactMessage } = require('./contact.repository');

module.exports = {
  getDBConnection,
  UserRepository,
  User,
  ContactRepository,
  ContactMessage
}