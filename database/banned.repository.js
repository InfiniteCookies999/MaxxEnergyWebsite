const getDBConnection = require('./connection');

class BannedRepository {

  async initialize() {
    const conn = await getDBConnection();

    await conn.query(`CREATE TABLE IF NOT EXISTS BannedUser (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      ip VARCHAR(100),
      userId INT,
      email VARCHAR(320),

      CONSTRAINT fk_bannedUser_userId
      FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
      )`);
  }

  async getBannedIps() {
    const conn = await getDBConnection();

    const [ results ] = await conn.query(`SELECT ip FROM BannedUser`);
    if (results.length === 0) {
      return [];
    }

    return results.map(r => r.ip);
  }

  async getBannedEmails() {
    const conn = await getDBConnection();

    const [ results ] = await conn.query(`SELECT email FROM BannedUser`);
    if (results.length === 0) {
      return [];
    }

    return results.map(r => r.email);
  }

  async getBannedUserIds() {
    const conn = await getDBConnection();

    const [ results ] = await conn.query(`SELECT userId FROM BannedUser`);
    if (results.length === 0) {
      return [];
    }

    return results.map(r => r.userId);
  }  
};

module.exports = new BannedRepository();