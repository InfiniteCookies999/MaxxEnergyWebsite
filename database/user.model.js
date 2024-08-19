
class User {
  constructor(id, firstName, lastName, email, phone, state, county,
              addressLine1, addressLine2,
              zipCode, password, joinDate) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.phone = phone;
    this.state = state;
    this.county = county;
    this.addressLine1 = addressLine1;
    this.addressLine2 = addressLine2;
    this.zipCode = zipCode;
    this.password = password;
    this.joinDate = joinDate;
  }
}

module.exports = User;