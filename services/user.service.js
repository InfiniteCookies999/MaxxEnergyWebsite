const bcrypt = require('bcryptjs');
const { HttpError } = require('../middleware');
const { UserRepository, User } = require('../database');
const FileService = require('./file.service');
const EmailVerifyService = require('./email.verify.service');
const PasswordResetService = require('./password.reset.service');

const HASH_STRENGTH = 10

class UserService {

  async register(dto, session, serverAddress) {

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
      dto.zipCode, hashedPassword, new Date(), null, false
    ));

    await EmailVerifyService.sendVerificationEmail(user, serverAddress);

    session.user = {
      id: user.id,
      emailVerified: false
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
      id: user.id,
      emailVerified: user.emailVerified !== 0
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

  async updateEmail(userId, email, session, serverAddress) {
    userId = this.getUserIdForUpdate(userId, session);

    const user = await UserRepository.getUserById(userId);
    const changeToExisting = user.email.toLowerCase() === email.toLowerCase();

    if ((await UserRepository.doesUserExistByEmail(email)) && !changeToExisting) {
      throw new HttpError("Email taken", 403);
    }

    // Because the user switched emails they now need to verify the new email.
    user.email = email; // Set the new email for updating.
    await EmailVerifyService.updateEmail(user, serverAddress);
    if (!changeToExisting) {
      // If the user is logged in we want to say that their email is
      // no longer verified.
      if (session.user) {
        session.emailVerified = false;
      }
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

  async verifyEmail(token, session) {
    
    const userId = await EmailVerifyService.verifyEmail(token);

    // Updating the user's database entry.
    await UserRepository.updateEmailVerified(userId, true);

    if (session.user) {
      if (session.user.id === userId) {
        session.user.emailVerified = true;
      }
    }

    return userId;
  }

  async resendEmailVerification(session, serverAddress) {
    
    const user = await this.getUser(session);

    await EmailVerifyService.sendVerificationEmail(user, serverAddress);
  }

  async sendPasswordReset(email) {
    const user = await UserRepository.getUserByEmail(email);
    if (!user) {
      throw new HttpError("Could not find email", 401);
    }

    await PasswordResetService.sendPasswordResetEmail(email);

  }

  async getUser(session) {
    if (!(session.user)) {
      throw new HttpError("Cannot get user's information. Not logged in", 401);
    }

    return await UserRepository.getUserById(session.user.id);
  }

  async getUserById(userId) {
    return await UserRepository.getUserById(userId);
  }
}

module.exports = new UserService();