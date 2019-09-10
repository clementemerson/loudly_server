const expect = require('expect');

const errors = require('../helpers/errorstousers');
const success = require('../helpers/successtousers');

const dbTransactions = require('../db/session');

const LoginController = require('../controllers/LoginController');

beforeAll(async () => {
  console.log = () => { };
});

beforeEach(() => {
  dbTransactions.start = jest.fn();
  dbTransactions.commit = jest.fn();
  dbTransactions.abort = jest.fn();
});

afterEach(() => {
});

afterAll(() => {
});

describe('getotp', () => {
  test('should exist', () => {
    // Expects
    expect(LoginController.getotp).toBeDefined();
  });

  test('should be a function', () => {
    // Expects
    expect(typeof LoginController.getotp).toBe('function');
  });
});

describe('verifyotp', () => {
  test('should exist', () => {
    // Expects
    expect(LoginController.verifyotp).toBeDefined();
  });

  test('should be a function', () => {
    // Expects
    expect(typeof LoginController.verifyotp).toBe('function');
  });
});

describe('getPhoneNumberBySessionId', () => {
  test('should exist', () => {
    // Expects
    expect(LoginController.getPhoneNumberBySessionId).toBeDefined();
  });

  test('should be a function', () => {
    // Expects
    expect(typeof LoginController.getPhoneNumberBySessionId).toBe('function');
  });
});

describe('getExistingUserInfoFromPhoneNumber', () => {
  test('should exist', () => {
    // Expects
    expect(LoginController.getExistingUserInfoFromPhoneNumber).toBeDefined();
  });

  test('should be a function', () => {
    // Expects
    expect(typeof LoginController.getExistingUserInfoFromPhoneNumber).toBe('function');
  });
});

describe('createUserInfo', () => {
  test('should exist', () => {
    // Expects
    expect(LoginController.createUserInfo).toBeDefined();
  });

  test('should be a function', () => {
    // Expects
    expect(typeof LoginController.createUserInfo).toBe('function');
  });
});
