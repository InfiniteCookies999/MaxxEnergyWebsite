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

      CONSTRAINT fk_userRole_userId
      FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
      )`);
  }

  async saveUserRole(userRole) {
    const conn = await getDBConnection();

    delete userRole.id;
    await conn.execute(`INSERT INTO UserRole (userId, roleName) VALUES (?, ?)`,
      Object.values(userRole));
  }

  async hasUserRole(userId, roleName) {
    const conn = await getDBConnection();

    const [ results ] = await conn.execute("SELECT * FROM UserRole WHERE userId=? AND roleName=?",
      [userId, roleName]);
    
    return results.length !== 0;
  }
}

module.exports = new UserRoleRepository();