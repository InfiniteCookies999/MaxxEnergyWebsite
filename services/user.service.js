const bcrypt = require('bcryptjs');
const { HttpError } = require('../middleware');
const { UserRepository, User } = require('../database');

const HASH_STRENGTH = 10

class UserService {

  async register(dto) {
    if (await UserRepository.doesUserExistByEmail(dto.email)) {
      throw new HttpError("Email taken", 403);
    }
    
    // TODO: Deal with email verification!
    const hashedPassword = await bcrypt.hash(dto.password, HASH_STRENGTH);

    await UserRepository.saveUser(new User(0,
      dto.firstName, dto.lastName, dto.email, dto.phoneNumber,
      dto.state, dto.county, dto.addressLine1, dto.addressLine2 || null,
      dto.zipCode, hashedPassword, new Date()
    ));
  }


  async login(email, password) {
    const invalidMessage = "Invalid email or password";

    const user = await UserRepository.getUserByEmail(email);
    if (!user) {
      throw new HttpError(invalidMessage, 401);
    }

    console.log(user);
  }
}

module.exports = new UserService();