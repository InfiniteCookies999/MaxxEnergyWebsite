const supertest = require("supertest");
const createApp = require('../../create.app');

const app = createApp();

function getValidBody() {
  return {
    firstName: "Susan",
    lastName: "Smith",
    email: "susansmith@gmail.com",
    phoneNumber: "999-999-9999",
    state: "VA",
    county: "Campbell County",
    addressLine1: "Street Ave. 1412",
    zipCode: 77777,
    password: "abcABC%*13"
  };
}

function fieldContainsError(errors, fieldName, errorMessage) {
  return errors.filter((error) => error.path === fieldName)
    .filter((error) => error.msg === errorMessage).length !== 0;
}

describe('route POST /user/register', () => {

  it('firstName empty', async () => {

    const body = getValidBody();
    body.firstName = "";

    await supertest(app)
      .post('/api/user/register')
      .send(body)
      .set('Content-Type', 'application/json')
      .expect(400)
      .then((res) => {
        const errors = res.body.message.errors;
        expect(fieldContainsError(errors, 'firstName', 'Cannot be empty')).toBe(true);
      });
  })
  it('firstName too long', async () => {

    const body = getValidBody();
    body.firstName = "ThisIsAReallyLongFirstNameAndSoItCannotBeAllowedDueItItsVeryVeryLongLengthThatExceedsTheAllowedLength";

    await supertest(app)
      .post('/api/user/register')
      .send(body)
      .set('Content-Type', 'application/json')
      .expect(400)
      .then((res) => {
        const errors = res.body.message.errors;
        expect(fieldContainsError(errors, 'firstName', 'Invalid length')).toBe(true);
      });
  })
  it('firstName not alphanumeric', async () => {

    const body = getValidBody();
    body.firstName = "Maddie&";

    await supertest(app)
      .post('/api/user/register')
      .send(body)
      .set('Content-Type', 'application/json')
      .expect(400)
      .then((res) => {
        const errors = res.body.message.errors;
        expect(fieldContainsError(errors, 'firstName', 'Name must be alphanumeric')).toBe(true);
      });
  })

  it('lastName empty', async () => {

    const body = getValidBody();
    body.lastName = "";

    await supertest(app)
      .post('/api/user/register')
      .send(body)
      .set('Content-Type', 'application/json')
      .expect(400)
      .then((res) => {
        const errors = res.body.message.errors;
        expect(fieldContainsError(errors, 'lastName', 'Cannot be empty')).toBe(true);
      });
  })
  it('lastName too long', async () => {

    const body = getValidBody();
    body.lastName = "ThisIsAReallyLongFirstNameAndSoItCannotBeAllowedDueItItsVeryVeryLongLengthThatExceedsTheAllowedLength";

    await supertest(app)
      .post('/api/user/register')
      .send(body)
      .set('Content-Type', 'application/json')
      .expect(400)
      .then((res) => {
        const errors = res.body.message.errors;
        expect(fieldContainsError(errors, 'lastName', 'Invalid length')).toBe(true);
      });
  })
  it('lastName not alphanumeric', async () => {

    const body = getValidBody();
    body.lastName = "Blah&";

    await supertest(app)
      .post('/api/user/register')
      .send(body)
      .set('Content-Type', 'application/json')
      .expect(400)
      .then((res) => {
        const errors = res.body.message.errors;
        expect(fieldContainsError(errors, 'lastName', 'Name must be alphanumeric')).toBe(true);
      });
  })

  it('empty email', async () => {

    const body = getValidBody();
    body.email = "";

    await supertest(app)
      .post('/api/user/register')
      .send(body)
      .set('Content-Type', 'application/json')
      .expect(400)
      .then((res) => {
        const errors = res.body.message.errors;
        expect(fieldContainsError(errors, 'email', 'Expected valid email address')).toBe(true);
      });
  })
  it('email invalid format', async () => {

    const body = getValidBody();
    body.email = "maddie@";

    await supertest(app)
      .post('/api/user/register')
      .send(body)
      .set('Content-Type', 'application/json')
      .expect(400)
      .then((res) => {
        const errors = res.body.message.errors;
        expect(fieldContainsError(errors, 'email', 'Expected valid email address')).toBe(true);
      });
  })

  it('state empty', async () => {

    const body = getValidBody();
    body.state = "";

    await supertest(app)
      .post('/api/user/register')
      .send(body)
      .set('Content-Type', 'application/json')
      .expect(400)
      .then((res) => {
        const errors = res.body.message.errors;
        expect(fieldContainsError(errors, 'state', 'Cannot be empty')).toBe(true);
      });
  })
  it('state unknown', async () => {

    const body = getValidBody();
    body.state = "ThisIsNotAState";

    await supertest(app)
      .post('/api/user/register')
      .send(body)
      .set('Content-Type', 'application/json')
      .expect(400)
      .then((res) => {
        const errors = res.body.message.errors;
        expect(fieldContainsError(errors, 'state', 'Unknown state')).toBe(true);
      });
  })

  it('county empty', async () => {

    const body = getValidBody();
    body.county = "";

    await supertest(app)
      .post('/api/user/register')
      .send(body)
      .set('Content-Type', 'application/json')
      .expect(400)
      .then((res) => {
        const errors = res.body.message.errors;
        expect(fieldContainsError(errors, 'county', 'Cannot be empty')).toBe(true);
      });
  })
  it('county unknown', async () => {

    const body = getValidBody();
    body.county = "ThisIsNotACounty";

    await supertest(app)
      .post('/api/user/register')
      .send(body)
      .set('Content-Type', 'application/json')
      .expect(400)
      .then((res) => {
        const errors = res.body.message.errors;
        expect(fieldContainsError(errors, 'county', 'Unknown county')).toBe(true);
      });
  })

  it('addressLine1 empty', async () => {

    const body = getValidBody();
    body.addressLine1 = "";

    await supertest(app)
      .post('/api/user/register')
      .send(body)
      .set('Content-Type', 'application/json')
      .expect(400)
      .then((res) => {
        const errors = res.body.message.errors;
        expect(fieldContainsError(errors, 'addressLine1', 'Cannot be empty')).toBe(true);
      });
  })
  it('addressLine1 invalid character', async () => {

    const body = getValidBody();
    body.addressLine1 = "Street Ave. 1321!";

    await supertest(app)
      .post('/api/user/register')
      .send(body)
      .set('Content-Type', 'application/json')
      .expect(400)
      .then((res) => {
        const errors = res.body.message.errors;
        expect(fieldContainsError(errors, 'addressLine1', 'Invalid address format')).toBe(true);
      });
  })
  it('addressLine1 too long', async () => {

    const body = getValidBody();
    body.addressLine1 = "a".repeat(500);

    await supertest(app)
      .post('/api/user/register')
      .send(body)
      .set('Content-Type', 'application/json')
      .expect(400)
      .then((res) => {
        const errors = res.body.message.errors;
        expect(fieldContainsError(errors, 'addressLine1', 'Invalid length')).toBe(true);
      });
  })

  it('addressLine2 empty', async () => {

    const body = getValidBody();
    body.addressLine2 = "";

    await supertest(app)
      .post('/api/user/register')
      .send(body)
      .set('Content-Type', 'application/json')
      .expect(400)
      .then((res) => {
        const errors = res.body.message.errors;
        expect(fieldContainsError(errors, 'addressLine2', 'Cannot be empty')).toBe(true);
      });
  })
  it('addressLine2 invalid character', async () => {

    const body = getValidBody();
    body.addressLine2 = "Street Ave. 1321!";

    await supertest(app)
      .post('/api/user/register')
      .send(body)
      .set('Content-Type', 'application/json')
      .expect(400)
      .then((res) => {
        const errors = res.body.message.errors;
        expect(fieldContainsError(errors, 'addressLine2', 'Invalid address format')).toBe(true);
      });
  })
  it('addressLine2 too long', async () => {

    const body = getValidBody();
    body.addressLine2 = "a".repeat(500);

    await supertest(app)
      .post('/api/user/register')
      .send(body)
      .set('Content-Type', 'application/json')
      .expect(400)
      .then((res) => {
        const errors = res.body.message.errors;
        expect(fieldContainsError(errors, 'addressLine2', 'Invalid length')).toBe(true);
      });
  })

  it('successfull user registered', async () => {

    const body = getValidBody();

    await supertest(app)
      .post('/api/user/register')
      .send(body)
      .set('Content-Type', 'application/json')
      .expect(200);

  })
});
