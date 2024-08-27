const bcrypt = require('bcryptjs');
const { HttpError } = require('../middleware');
const { UserRepository, User } = require('../database');
const FileService = require('./file.service');
const EmailService = require('./email.service');

const HASH_STRENGTH = 10

class UserService {

  async register(dto, session) {

    if (session.user) {
      // The user is already logged in. They cannot register while logged in.
      throw new HttpError("Already logged in", 409);
    }
    if (await UserRepository.doesUserExistByEmail(dto.email)) {
      throw new HttpError("Email taken", 403);
    }
    
    const hashedPassword = await bcrypt.hash(dto.password, HASH_STRENGTH);

    const user = await UserRepository.saveUser(new User(0,
      dto.firstName, dto.lastName, dto.email, dto.phoneNumber,
      dto.state, dto.county, dto.addressLine1, dto.addressLine2 || null,
      dto.zipCode, hashedPassword, new Date(), null
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

  getUserIdForUpdate(userId, session) {
    if (!userId) {
      return session.user.id;
    } else {
      throw new HttpError("No admin permissions yet", 401);
    }
  }

  async updateName(userId, firstName, lastName, session) {
    userId = this.getUserIdForUpdate(userId, session);

    await UserRepository.updateUsersName(userId, firstName, lastName);
  }

  async updateEmail(userId, email, session) {
    userId = this.getUserIdForUpdate(userId, session);

    const user = await UserRepository.getUserById(userId);
    const changeToExisting = user.email.toLowerCase() === email.toLowerCase();

    // TODO: This needs to be fixed so that if the email is already the
    // user's email then it should be fine with "updating it".
    if ((await UserRepository.doesUserExistByEmail(email)) && !changeToExisting) {
      throw new HttpError("Email taken", 403);
    }

    await UserRepository.updateUsersEmail(userId, email)
  }

  async updatePhoneNumber(userId, phone, session) {
    userId = this.getUserIdForUpdate(userId, session);

    await UserRepository.updateUsersPhone(userId, phone);
  }

  async updateAddress(userId, state, county, addressLine1, addressLine2, zipCode, session) {
    userId = this.getUserIdForUpdate(userId, session);

    await UserRepository.updateUsersAddress(
      userId, state, county, addressLine1, addressLine2, zipCode);
  }

  async updatePassword(userId, oldPassword, newPassword, session) {
    userId = this.getUserIdForUpdate(userId, session);

    const user = await UserRepository.getUserById(userId);
    
    const hashedPassword = user.password;
    if (!(await bcrypt.compare(oldPassword, hashedPassword))) {
      throw new HttpError("Incorrect password", 401);
    }
    
    const newHashedPassword = await bcrypt.hash(newPassword, HASH_STRENGTH);
    await UserRepository.updatePassword(userId, newHashedPassword);
  }

  async updateProfilePic(userId, file, session) {
    userId = this.getUserIdForUpdate(userId, session);

    const user = await UserRepository.getUserById(userId);
    
    let oldFile = FileService.fixStoredFile(userId, user.profilePicFile);
    
    const profilePicFile = FileService
      .moveFileWithRandomName(userId, file, 'public/upload/profilepics', oldFile);
  
    await UserRepository.updateProfilePic(userId, profilePicFile);
  }

  async getUser(session) {
    if (!(session.user)) {
      throw new HttpError("Cannot get user's information. Not logged in", 401);
    }

    return await UserRepository.getUserById(session.user.id);
  }
}

module.exports = new UserService();