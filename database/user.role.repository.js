const getDBConnection = require('./connection');

class UserRoleRepository {

  adminRole() {
    return 'admin';
  }

  async initialize() {
    const conn = await getDBConnection();

    await conn.query(`CREATE TABLE IF NOT EXISTS UserRole (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      roleName VARCHAR(255) NOT NULL,

      FOREIGN KEY (userId) REFERENCES user(id)
      )`);
  }
}

module.exports = new UserRoleRepository();