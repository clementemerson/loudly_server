const expect = require('expect');

const dbTransactions = require('../db/session');

const UpdateController = require('../controllers/UpdateController');

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

describe('sendPollUpdates', () => {
  test('should exist', () => {
    // Expects
    expect(UpdateController.sendPollUpdates).toBeDefined();
  });

  test('should be a function', () => {
    // Expects
    expect(typeof UpdateController.sendPollUpdates).toBe('function');
  });
});

describe('sendGroupUpdate', () => {
  test('should exist', () => {
    // Expects
    expect(UpdateController.sendGroupUpdate).toBeDefined();
  });

  test('should be a function', () => {
    // Expects
    expect(typeof UpdateController.sendGroupUpdate).toBe('function');
  });
});

describe('sendGroupUserUpdate', () => {
  test('should exist', () => {
    // Expects
    expect(UpdateController.sendGroupUserUpdate).toBeDefined();
  });

  test('should be a function', () => {
    // Expects
    expect(typeof UpdateController.sendGroupUserUpdate).toBe('function');
  });
});

describe('sendGroupPollUpdate', () => {
  test('should exist', () => {
    // Expects
    expect(UpdateController.sendGroupPollUpdate).toBeDefined();
  });

  test('should be a function', () => {
    // Expects
    expect(typeof UpdateController.sendGroupPollUpdate).toBe('function');
  });
});
