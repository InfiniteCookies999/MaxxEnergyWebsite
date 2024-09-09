const getDBConnection = require('./connection');

class UserRoleRepository {

  adminRole() {
    return 'admin';
  }

  memberRole() {
    return 'member';
  }

  rolls() {
    return [ this.adminRole(), this.memberRole() ];
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

  async saveUserRoleIfNotExists(userRole) {
    const conn = await getDBConnection();

    await conn.execute(`INSERT INTO UserRole (userId, roleName) 
      SELECT ?, ?
      WHERE NOT EXISTS (
          SELECT 1 FROM UserRole WHERE userId=? AND roleName=?
      );
      `,
      [ userRole.userId, userRole.roleName, userRole.userId, userRole.roleName ]);
  }

  async deleteRoleByUserIdAndRoleName(userId, roleName) {
    const conn = await getDBConnection();

    await conn.query(`DELETE FROM UserRole WHERE userId=? AND roleName=?`,
      [userId, roleName]);

  }

  async hasUserRole(userId, roleName) {
    const conn = await getDBConnection();

    const [ results ] = await conn.execute("SELECT * FROM UserRole WHERE userId=? AND roleName=?",
      [userId, roleName]);
    
    return results.length !== 0;
  }

  async getRolesForUserId(userId) {
    const conn = await getDBConnection();

    const [ results ] = await conn.execute("SELECT * FROM UserRole WHERE userId=?",
      [userId]);

    return results;
  }
}

module.exports = new UserRoleRepository();