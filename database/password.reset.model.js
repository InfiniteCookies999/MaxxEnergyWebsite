
class PasswordReset {
  constructor(id, userId, resetKey, createdAt) {
    this.id = id;
    this.userId = userId;
    this.resetKey = resetKey;
    this.createdAt = createdAt;
  }
}

module.exports = PasswordReset;