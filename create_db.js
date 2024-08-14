// Simple utility script for creating the database from given the information in .env file.
const mysql = require('mysql2/promise');
const config = require('./config');

(async () => {

  const DATABASE_ADDRESS  = config.DATABASE_ADDRESS || 'localhost';
  const DATABASE_PORT     = config.DATABASE_PORT || 3306;
  const DATABASE_PASSWORD = config.DATABASE_PASSWORD || undefined;
  
  if (!config.DATABASE_USER) {
    throw new Error("Must include DATABASE_USER in your .env file");
  }
  if (!config.DATABASE_NAME) {
    throw new Error("Must include DATABASE_NAME in your .env file");
  }

  const connection = await mysql.createConnection({
    host: DATABASE_ADDRESS,
    user: config.DATABASE_USER,
    database: 'mysql',
    port: DATABASE_PORT,
    password: DATABASE_PASSWORD
  });
  console.log("Connection created");
  
  await connection.query(`CREATE DATABASE IF NOT EXISTS ${config.DATABASE_NAME}`);
  
  console.log("Finished");
  process.exit();

})();
