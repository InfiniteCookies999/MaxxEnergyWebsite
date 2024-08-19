const bcrypt = require('bcryptjs');
const { HttpError } = require('../middleware');
const { UserRepository, User } = require('../database');

const HASH_STRENGTH = 10

class UserService {

  async register(dto, session) {
    if (await UserRepository.doesUserExistByEmail(dto.email)) {
      throw new HttpError("Email taken", 403);
    }
    
    // TODO: Deal with email verification!
    const hashedPassword = await bcrypt.hash(dto.password, HASH_STRENGTH);

    const user = await UserRepository.saveUser(new User(0,
      dto.firstName, dto.lastName, dto.email, dto.phoneNumber,
      dto.state, dto.county, dto.addressLine1, dto.addressLine2 || null,
      dto.zipCode, hashedPassword, new Date()
    ));

    session.user = {
      id: user.id
    }
  }


  async login(email, password, session) {
    if (session.user) {
      // The user is already logged in. They cannot login again.
      throw new HttpError("Already logged in", 409);
    }

    const invalidMessage = "Invalid email or password";

    const user = await UserRepository.getUserByEmail(email);
    if (!user) {
      throw new HttpError(invalidMessage, 401);
    }

    const hashedPassword = user.password;
    if (!(await bcrypt.compare(password, hashedPassword))) {
      throw new HttpError(invalidMessage, 401);
    }

    // The user provided correct credentials. Creating a user session.
    session.user = {
      id: user.id
    }
  }

  async getUser(session) {
    if (!(session.user)) {
      throw new HttpError("Cannot get user's information. Not logged in", 401);
    }

    return await UserRepository.getUserById(session.user.id);
  }
}

module.exports = new UserService();