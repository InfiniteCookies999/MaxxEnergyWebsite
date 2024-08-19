const getDBConnection = require('./connection');
const UserRepository = require('./user.repository');
const User = require('./user.model');
const { ContactRepository, ContactMessage } = require('./contact.repository');

module.exports = {
  getDBConnection,
  UserRepository,
  User,
  ContactRepository,
  ContactMessage
}