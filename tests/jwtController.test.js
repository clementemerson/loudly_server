const expect = require('expect');

const dbTransactions = require('../db/session');

const jwtController = require('../controllers/jwtController');

beforeAll(async () => {
  console.log = () => {};
});

beforeEach(() => {
  dbTransactions.start = jest.fn();
  dbTransactions.commit = jest.fn();
  dbTransactions.abort = jest.fn();
});

afterEach(() => {});

afterAll(() => {});

describe('validateJwt', () => {
  test('should exist', () => {
    // Expects
    expect(jwtController.validateJwt).toBeDefined();
  });

  test('should be a function', () => {
    // Expects
    expect(typeof jwtController.validateJwt).toBe('function');
  });
});

describe('validateJwtData', () => {
  test('should exist', () => {
    // Expects
    expect(jwtController.validateJwtData).toBeDefined();
  });

  test('should be a function', () => {
    // Expects
    expect(typeof jwtController.validateJwtData).toBe('function');
  });
});

describe('signjwt', () => {
  test('should exist', () => {
    // Expects
    expect(jwtController.signjwt).toBeDefined();
  });

  test('should be a function', () => {
    // Expects
    expect(typeof jwtController.signjwt).toBe('function');
  });
});
