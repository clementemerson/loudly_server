const expect = require('expect');

const redClient = require('../redis/redclient');

const errors = require('../helpers/errorstousers');
const success = require('../helpers/successtousers');

const dbTransactions = require('../db/session');

// Testing
const PollSubsController = require('../controllers/PollSubsController');

// Dependents
const redHelper = require('../redis/redhelper');
const connections = require('../websockets/connections');
const keyPrefix = require('../redis/key_prefix');

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

describe('subscribeToPollResult', () => {
  test('should exist', () => {
    // Expects
    expect(PollSubsController.subscribeToPollResult).toBeDefined();
  });

  test('should be a function', () => {
    // Expects
    expect(typeof PollSubsController.subscribeToPollResult).toBe('function');
  });

  test('should fail for invalid userid', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = '2004';
      const pollid = 1002;
      // Tests
      await PollSubsController.subscribeToPollResult(userid, pollid);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'userid\' must be a number');
    }
  });

  test('should fail for invalid pollid', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const pollid = '1002';
      // Tests
      await PollSubsController.subscribeToPollResult(userid, pollid);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'pollid\' must be a number');
    }
  });

  test('should fail if user has not voted yet', async () => {
    // Mocks
    redClient.sismember = jest.fn().mockImplementation(() => false);
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const pollid = 1002;
      // Tests
      await PollSubsController.subscribeToPollResult(userid, pollid);
    } catch (err) {
      // Expects
      expect(err.message).toEqual(errors.errorUserNotVoted.message);
    }
  });

  test('should fail on error', async () => {
    // Mocks
    redClient.sismember = jest.fn().mockImplementation(() => true);
    redClient.zadd = jest.fn().mockImplementation(() => {
      throw new Error('');
    });
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const pollid = 1002;
      // Tests
      await PollSubsController.subscribeToPollResult(userid, pollid);
    } catch (err) {
      // Expects
      expect(err.message).toContain(errors.internalError.message);
    }
  });

  test('should pass', async () => {
    // Mocks
    const pollResult = {
      data: 101,
    };
    const expectedResult = {
      status: success.userSubscribedToPollResult,
    };
    redClient.sismember = jest.fn().mockImplementation(() => true);
    redClient.zadd = jest.fn();
    redHelper.getPollResult = jest.fn().mockImplementation(() => pollResult);
    connections.inform = jest.fn();
    // Mock new Date()
    const DATE_TO_USE = new Date();
    const _Date = Date;
    global.Date = jest.fn(() => DATE_TO_USE);
    global.Date.UTC = _Date.UTC;
    global.Date.parse = _Date.parse;
    global.Date.now = _Date.now;
    // Data
    const userid = 2004;
    const pollid = 1002;
    // Tests
    const reply = await PollSubsController.subscribeToPollResult(
        userid,
        pollid
    );
    // Expects
    expect(redClient.zadd).toHaveBeenCalledWith(
        keyPrefix.pollSubsription + pollid,
        userid,
        DATE_TO_USE.getTime()
    );
    expect(redHelper.getPollResult).toHaveBeenCalledWith(pollid);
    expect(connections.inform).toHaveBeenCalledWith(userid, pollResult);
    expect(reply).toEqual(expectedResult);
  });
});

describe('unSubscribeToPollResult', () => {
  test('should exist', () => {
    // Expects
    expect(PollSubsController.unSubscribeToPollResult).toBeDefined();
  });

  test('should be a function', () => {
    // Expects
    expect(typeof PollSubsController.unSubscribeToPollResult).toBe('function');
  });

  test('should fail for invalid userid', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = '2004';
      const pollid = 1002;
      // Tests
      await PollSubsController.unSubscribeToPollResult(userid, pollid);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'userid\' must be a number');
    }
  });

  test('should fail for invalid pollid', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const pollid = '1002';
      // Tests
      await PollSubsController.unSubscribeToPollResult(userid, pollid);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'pollid\' must be a number');
    }
  });

  test('should fail on error', async () => {
    // Mocks
    redClient.srem = jest.fn().mockImplementation(() => {
      throw new Error('');
    });
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const pollid = 1002;
      // Tests
      await PollSubsController.unSubscribeToPollResult(userid, pollid);
    } catch (err) {
      // Expects
      expect(err.message).toContain(errors.internalError.message);
    }
  });

  test('should pass', async () => {
    // Mocks
    const expectedResult = {
      status: success.userUnSubscribedToPollResult,
    };
    redClient.srem = jest.fn();
    // Data
    const userid = 2004;
    const pollid = 1002;
    // Tests
    const reply = await PollSubsController.unSubscribeToPollResult(
        userid,
        pollid
    );
    // Expects
    expect(redClient.srem).toHaveBeenCalledWith(
        keyPrefix.pollSubsription + pollid,
        userid
    );
    expect(reply).toEqual(expectedResult);
  });
});
