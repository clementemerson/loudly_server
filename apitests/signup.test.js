const expect = require('expect');
const testUtil = require('../testutil/testUtil');

const errors = require('../helpers/errorstousers');
const success = require('../helpers/successtousers');

beforeAll(async () => {
    console.log = () => { };
});

beforeEach(() => { });

afterEach(() => { });

afterAll(() => { });

describe('/getotp/:phonenumber', () => {
    test('should fail if phonenumber is undefined', async () => {

    });

    test('should fail if phonenumber is invalid ', async () => {

    });

    test('should fail if phonenumber is empty', async () => {

    });

    test('should fail if otp provider not responds', async () => {

    });

    test('should pass in normal condition', async () => {

    });
});

describe('/signin', () => {
    test('should fail if sessionid is undefined', async () => {

    });

    test('should fail if otp is undefined', async () => {

    });

    test('should fail if otp provider not responds', async () => {

    });

    test('should fail if getting phonenumber from sessionid fails', async () => {

    });

    test('should fail if checking existinguser for phonenumber fails', async () => {

    });

    test('should create a new user', async () => {

    });

    test('should update a existing user', async () => {

    });

    test('should update a existing user and disconnects existing connection if any', async () => {

    });
});