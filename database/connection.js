const mysql = require('mysql2/promise');
const config = require('../config');
// Consider reading: https://medium.com/@havus.it/understanding-connection-pooling-for-mysql-28be6c9e2dc0

var connection;

module.exports = async function getDBConnection() {
  if (connection) {
    return connection;
  }

  if (!config.DATABASE_USER) {
    throw new Error("Must include DATABASE_USER in your .env file");
  }
  if (!config.DATABASE_NAME) {
    throw new Error("Must include DATABASE_NAME in your .env file");
  }
  
  const DATABASE_ADDRESS  = config.DATABASE_ADDRESS || 'localhost';
  const DATABASE_PORT     = config.DATABASE_PORT || 3306;
  const DATABASE_PASSWORD = config.DATABASE_PASSWORD || undefined;
  
  connection = await mysql.createConnection({
    host: DATABASE_ADDRESS,
    user: config.DATABASE_USER,
    database: config.DATABASE_NAME,
    port: DATABASE_PORT,
    password: DATABASE_PASSWORD
  });
  return connection;
};