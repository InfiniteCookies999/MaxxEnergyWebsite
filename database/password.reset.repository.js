const getDBConnection = require('./connection');
const PasswordReset = require('./password.reset.model');

class PasswordResetRepository {

  async initialize() {
    const conn = await getDBConnection();

    await conn.query(`CREATE TABLE IF NOT EXISTS PasswordReset (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      resetKey VARCHAR(255) NOT NULL UNIQUE,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (UserId) REFERENCES user(id)
      )`);
  }

  async savePasswordReset(passwordReset) {
    const conn = await getDBConnection();

    delete passwordReset.id;
    delete passwordReset.createdAt;
    await conn.execute(`INSERT INTO PasswordReset (userId, resetKey) VALUES (?, ?)`,
      Object.values(passwordReset));
    
  }
}

module.exports = new PasswordResetRepository();