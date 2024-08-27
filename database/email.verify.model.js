
class EmailVerify {
  constructor(id, userId, verifyKey, createdAt) {
    this.id = id;
    this.userId = userId;
    this.verifyKey = verifyKey;
    this.createdAt = createdAt;
  }
}

module.exports = EmailVerify;