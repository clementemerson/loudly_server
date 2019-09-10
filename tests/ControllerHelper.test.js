const expect = require('expect');

const errors = require('../helpers/errorstousers');
const success = require('../helpers/successtousers');

const dbTransactions = require('../db/session');

const ControllerHelper = require('../controllers/ControllerHelper');

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

describe('informGroupUpdate', () => {
  test('should exist', () => {
    // Expects
    expect(ControllerHelper.informGroupUpdate).toBeDefined();
  });

  test('should be a function', () => {
    // Expects
    expect(typeof ControllerHelper.informGroupUpdate).toBe('function');
  });
});

describe('informGroupUserUpdate', () => {
  test('should exist', () => {
    // Expects
    expect(ControllerHelper.informGroupUserUpdate).toBeDefined();
  });

  test('should be a function', () => {
    // Expects
    expect(typeof ControllerHelper.informGroupUserUpdate).toBe('function');
  });
});

describe('informNewPollInGroup', () => {
  test('should exist', () => {
    // Expects
    expect(ControllerHelper.informNewPollInGroup).toBeDefined();
  });

  test('should be a function', () => {
    // Expects
    expect(typeof ControllerHelper.informNewPollInGroup).toBe('function');
  });
});
