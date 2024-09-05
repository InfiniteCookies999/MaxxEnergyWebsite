const getDBConnection = require('./connection');
const EmailVerify = require('./email.verify.model');

class EmailVerifyRepository {
  
  async initialize() {
    const conn = await getDBConnection();

    await conn.query(`CREATE TABLE IF NOT EXISTS EmailVerify (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      verifyKey VARCHAR(255) NOT NULL UNIQUE,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT fk_emailVerify_userId
      FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
      )`);
  }

  async saveEmailVerify(emailVerify) {
    const conn = await getDBConnection();

    delete emailVerify.id;
    delete emailVerify.createdAt;
    await conn.execute(`INSERT INTO EmailVerify (userId, verifyKey) VALUES (?, ?)`,
      Object.values(emailVerify));
    
    return await this.getEmailVerifyByVerifyKey(emailVerify.verifyKey);
  }

  async getEmailVerifyByVerifyKey(key) {
    const conn = await getDBConnection();

    const [ results ] = await conn.execute(`SELECT * FROM EmailVerify WHERE verifyKey=?`, [ key ]);
    if (results.length === 0) {
      return null;
    }

    const emailVerify = new EmailVerify(...Object.values(results[0]));
    return emailVerify;
  }

  async deleteAllVerifyEntriesByUserId(userId) {
    const conn = await getDBConnection();

    await conn.execute(`DELETE FROM EmailVerify WHERE userId=?`, [ userId ]);
  }
}

module.exports = new EmailVerifyRepository();