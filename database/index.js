const getDBConnection = require('./connection');
const { UserRepository, User } = require('./user.repository');

module.exports = { 
  getDBConnection,
  UserRepository,
  User
}