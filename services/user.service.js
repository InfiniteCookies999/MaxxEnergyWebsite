const bcrypt = require('bcryptjs');
const { HttpError } = require('../middleware');
const { UserRepository, User } = require('../database');

const HASH_STRENGTH = 10

class UserService {

  async register(dto) {
    if (UserRepository.doesUserExistByEmail(dto.email)) {
      //throw new HttpError()
    }
    
    const hashedPassword = await bcrypt.hash(dto.password, HASH_STRENGTH);

    UserRepository.saveUser(new User(
      dto.firstName, dto.lastName, dto.email, dto.phoneNumber,
      dto.state, dto.county, dto.addressLine1, dto.addressLine2,
      dto.zipCode, hashedPassword, new Date()
    ));
  }


  async login(email, password) {
    
  }
}

module.exports = new UserService();