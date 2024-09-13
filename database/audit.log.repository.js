const getDBConnection = require('./connection');

class AuditLogRepository {

  async initialize() {
    const conn = await getDBConnection();

    await conn.query(`CREATE TABLE IF NOT EXISTS AuditLog (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      action ENUM('created', 'deleted', 'updated', 'function') NOT NULL,
      description VARCHAR(300) NOT NULL,
      date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      
      CONSTRAINT fk_auditLog_userId
      FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
      )`);
  }

  async saveAuditLog(userId, action, description) {
    const conn = await getDBConnection();

    await conn.execute(`INSERT INTO AuditLog (userId, action, description)
                        VALUES (?, ?, ?)`,
      [ userId, action, description ]);
    
  }

  async saveCreatedAuditLog(userId, description) {
    await this.saveAuditLog(userId, 'created', description);
  }

  async saveUpdatedAuditLog(userId, description) {
    await this.saveAuditLog(userId, 'updated', description);
  }

  async saveDeletedAuditLog(userId, description) {
    await this.saveAuditLog(userId, 'deleted', description);
  }

  async saveFunctionAuditLog(userId, description) {
    await this.saveAuditLog(userId, 'function', description);
  }

  async getAuditLogsForUserId(userId) {
    const conn = await getDBConnection();

    const [ results ] = await conn.execute(`
      SELECT * FROM AuditLog WHERE userId=?
      ORDER BY date DESC`,
      [userId]);

    return results;
  }
}

module.exports = new AuditLogRepository();