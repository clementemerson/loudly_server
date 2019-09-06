const expect = require('expect');

const redClient = require('../redis/redclient');
const mongo = require('../db/mongo');

const errors = require('../helpers/errorstousers');
const success = require('../helpers/successtousers');

const UserController = require('../controllers/UserController');

// For Mocking
const dbTransactions = require('../db/session');
const dbUsers = require('../db/users');
const GroupUsers = require('../db/groupusers');
const UserPolls = require('../db/userpolls');
const redHelper = require('../redis/redhelper');

jest.mock('../db/users');
jest.mock('../redis/redhelper');

beforeAll(async () => {
  await redClient.initRedisClient();
  await mongo.initDbConnection();
  console.log = () => {};
});

beforeEach(() => {
  dbTransactions.start = jest.fn();
  dbTransactions.commit = jest.fn();
  dbTransactions.abort = jest.fn();

  dbUsers.getUserInfoByUserIds = jest.fn();
  GroupUsers.getGroupsOfUser = jest.fn();
  UserPolls.getPolls = jest.fn();
});

afterEach(() => {
});

afterAll(() => {
});

describe('getUsersFromPhoneNumbers', () => {
  test('should exist', () => {
    // Expects
    expect(UserController.getUsersFromPhoneNumbers).toBeDefined();
  });

  test('should be a function', () => {
    // Expects
    expect(typeof UserController.getUsersFromPhoneNumbers).toBe('function');
  });

  test('should fail for invalid userid', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = '2004';
      const phoneNumbers = ['1545151215'];
      // Tests
      await UserController.getUsersFromPhoneNumbers(userid, phoneNumbers);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'userid\' must be a number');
    }
  });

  test('should fail for invalid phoneNumbers', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const phoneNumbers = '12156515';
      // Tests
      await UserController.getUsersFromPhoneNumbers(userid, phoneNumbers);
    } catch (err) {
      // Expects
      expect(err.message)
          .toEqual('argument \'phoneNumbers\' must be nonEmptyString[]');
    }
  });

  test('should fail for non-string phoneNumbers', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const phoneNumbers = ['1545151215', 515511];
      // Tests
      await UserController.getUsersFromPhoneNumbers(userid, phoneNumbers);
    } catch (err) {
      // Expects
      expect(err.message)
          .toEqual('argument \'phoneNumbers\' must be nonEmptyString[]');
    }
  });

  test('should fail for empty phoneNumbers', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const phoneNumbers = ['1545151215', ''];
      // Tests
      await UserController.getUsersFromPhoneNumbers(userid, phoneNumbers);
    } catch (err) {
      // Expects
      expect(err.message)
          .toEqual('argument \'phoneNumbers\' must be nonEmptyString[]');
    }
  });

  test('should return user info', async () => {
    // Mocks
    redHelper.getUserIdsByPhone
        .mockImplementation(() => [{id: 456}, {id: 565}]);
    // Data
    const userid = 2004;
    const phoneNumbers = ['1545151215', 'sfadfadf'];
    // Tests
    await UserController.getUsersFromPhoneNumbers(userid, phoneNumbers);
    // Expects
    expect(dbUsers.getUserInfoByUserIds).toBeCalledWith([456, 565]);
  });

  test('should fail if got error', async () => {
    // Mocks
    redHelper.getUserIdsByPhone
        .mockImplementation(() => {
          throw new Error('');
        });
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const phoneNumbers = ['1545151215', 'sfadfadf'];
      // Tests
      await UserController.getUsersFromPhoneNumbers(userid, phoneNumbers);
    } catch (err) {
      expect(err.message).toContain(errors.internalError.message);
    }
  });
});

describe('getGroups', () => {
  test('should exist', () => {
    // Expects
    expect(UserController.getGroups).toBeDefined();
  });

  test('should be a function', () => {
    // Expects
    expect(typeof UserController.getGroups).toBe('function');
  });

  test('should fail for invalid userid', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = '2004';
      // Tests
      await UserController.getGroups(userid);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'userid\' must be a number');
    }
  });

  test('should return groups of the user', async () => {
    // Data
    const userid = 2004;
    // Tests
    await UserController.getGroups(userid);
    expect(GroupUsers.getGroupsOfUser).toBeCalledWith(userid);
  });

  test('should fail on error', async () => {
    // Mocks
    GroupUsers.getGroupsOfUser = jest.fn()
        .mockImplementation(() => {
          throw new Error('');
        });
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      // Tests
      await UserController.getGroups(userid);
    } catch (err) {
      expect(err.message).toContain(errors.internalError.message);
    }
  });
});

describe('getPolls', () => {
  test('should exist', () => {
    // Expects
    expect(UserController.getPolls).toBeDefined();
  });

  test('should be a function', () => {
    // Expects
    expect(typeof UserController.getPolls).toBe('function');
  });

  test('should fail for invalid userid', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = '2004';
      // Tests
      await UserController.getPolls(userid);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'userid\' must be a number');
    }
  });

  test('should return polls of the user', async () => {
    // Data
    const userid = 2004;
    // Tests
    await UserController.getPolls(userid);
    expect(UserPolls.getPolls).toBeCalledWith(userid);
  });

  test('should fail on error', async () => {
    // Mocks
    UserPolls.getPolls = jest.fn()
        .mockImplementation(() => {
          throw new Error('');
        });
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      // Tests
      await UserController.getPolls(userid);
    } catch (err) {
      expect(err.message).toContain(errors.internalError.message);
    }
  });
});

describe('getInfo', () => {
  test('should exist', () => {
    // Expects
    expect(UserController.getInfo).toBeDefined();
  });

  test('should be a function', () => {
    // Expects
    expect(typeof UserController.getInfo).toBe('function');
  });

  test('should fail for single string userids', async () => {
    expect.assertions(1);
    try {
      // Data
      const userids = '2004';
      // Tests
      await UserController.getInfo(userids);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'userids\' must be number[]');
    }
  });

  test('should fail for single number userids', async () => {
    expect.assertions(1);
    try {
      // Data
      const userids = 2004;
      // Tests
      await UserController.getInfo(userids);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'userids\' must be number[]');
    }
  });

  test('should fail for array of string in userids', async () => {
    expect.assertions(1);
    try {
      // Data
      const userids = ['2004', '2005'];
      // Tests
      await UserController.getInfo(userids);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'userids\' must be number[]');
    }
  });

  test('should fail for array with empty string in userids', async () => {
    expect.assertions(1);
    try {
      // Data
      const userids = ['2004', ''];
      // Tests
      await UserController.getInfo(userids);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'userids\' must be number[]');
    }
  });

  test('should return userinfo for the given ids', async () => {
    // Data
    const userids = [2004, 2005];
    // Tests
    await UserController.getInfo(userids);
    expect(dbUsers.getUserInfoByUserIds).toBeCalledWith(userids);
  });

  test('should fail on error', async () => {
    // Mocks
    dbUsers.getUserInfoByUserIds = jest.fn()
        .mockImplementation(() => {
          throw new Error('');
        });
    expect.assertions(1);
    try {
      // Data
      const userids = [2004, 2005];
      // Tests
      await UserController.getInfo(userids);
    } catch (err) {
      expect(err.message).toContain(errors.internalError.message);
    }
  });
});

describe('changeName', () => {
  test('should exist', () => {
    // Expects
    expect(UserController.changeName).toBeDefined();
  });

  test('should be a function', () => {
    // Expects
    expect(typeof UserController.changeName).toBe('function');
  });

  test('should fail for invalid userid', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = '2004';
      const name = 'new name _testing';
      // Tests
      await UserController.changeName(userid, name);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'userid\' must be a number');
    }
  });

  test('should fail for invalid name', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const name = 154651;
      // Tests
      await UserController.changeName(userid, name);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'name\' must be a nonEmptyString');
    }
  });

  test('should fail for empty name', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const name = '';
      // Tests
      await UserController.changeName(userid, name);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'name\' must be a nonEmptyString');
    }
  });

  test('should change name of the user', async () => {
    // Mocks
    const dbUsersChangeName = dbUsers.changeName.mockImplementation(() => { });
    // Data
    const userid = 2004;
    const name = 'new name _testing';
    // Tests
    const reply = await UserController.changeName(userid, name);
    const expectedResult = {
      status: success.userNameChanged,
    };
    // Expects
    expect(reply).toMatchObject(expectedResult);
    expect(dbTransactions.start).toHaveBeenCalled();
    expect(dbTransactions.commit).toHaveBeenCalled();
    expect(dbUsersChangeName).toHaveBeenCalled();
    expect(dbTransactions.abort).not.toHaveBeenCalled();
  });

  test('should throw error if Users.changeName failed', async () => {
    // Mocks
    const dbUsersChangeName = dbUsers.changeName.mockImplementation(() => {
      throw new Error('');
    });
    expect.assertions(5);
    try {
      // Data
      const userid = 2004;
      const name = 'new name _testing';
      // Tests
      await UserController.changeName(userid, name);
    } catch (err) {
      // Expects
      expect(err.message).toContain(errors.internalError.message);
      expect(dbTransactions.start).toHaveBeenCalled();
      expect(dbUsersChangeName).toHaveBeenCalled();
      expect(dbTransactions.commit).not.toHaveBeenCalled();
      expect(dbTransactions.abort).toHaveBeenCalled();
    }
  });
});

describe('changeStatusMsg', () => {
  test('should exist', () => {
    // Expects
    expect(UserController.changeStatusMsg).toBeDefined();
  });

  test('should be a function', () => {
    // Expects
    expect(typeof UserController.changeStatusMsg).toBe('function');
  });

  test('should fail for invalid userid', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = '2004';
      const statusmsg = 'new status msg _testing';
      // Tests
      await UserController.changeStatusMsg(userid, statusmsg);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'userid\' must be a number');
    }
  });

  test('should fail for invalid statusmsg', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const statusmsg = 154651;
      // Tests
      await UserController.changeStatusMsg(userid, statusmsg);
    } catch (err) {
      // Expects
      expect(err.message)
          .toEqual('argument \'statusmsg\' must be a nonEmptyString');
    }
  });

  test('should fail for empty statusmsg', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const statusmsg = '';
      // Tests
      await UserController.changeStatusMsg(userid, statusmsg);
    } catch (err) {
      // Expects
      expect(err.message)
          .toEqual('argument \'statusmsg\' must be a nonEmptyString');
    }
  });

  test('should change statusmsg of the user', async () => {
    // Mocks
    const dbUsersChangeStatusMsg = dbUsers.changeStatusMsg
        .mockImplementation(() => { });
    // Data
    const userid = 2004;
    const statusmsg = 'new status msg _testing';
    // Tests
    const reply = await UserController.changeStatusMsg(userid, statusmsg);
    const expectedResult = {
      status: success.userStatusChanged,
    };
    // Expects
    expect(reply).toMatchObject(expectedResult);
    expect(dbTransactions.start).toHaveBeenCalled();
    expect(dbTransactions.commit).toHaveBeenCalled();
    expect(dbUsersChangeStatusMsg).toHaveBeenCalled();
    expect(dbTransactions.abort).not.toHaveBeenCalled();
  });

  test('should throw error if Users.changeStatusMsg failed', async () => {
    // Mocks
    const dbUsersChangeStatusMsg = dbUsers.changeStatusMsg
        .mockImplementation(() => {
          throw new Error('');
        });
    expect.assertions(5);
    try {
      // Data
      const userid = 2004;
      const statusmsg = 'new status msg _testing';
      // Tests
      await UserController.changeStatusMsg(userid, statusmsg);
    } catch (err) {
      // Expects
      expect(err.message).toContain(errors.internalError.message);
      expect(dbTransactions.start).toHaveBeenCalled();
      expect(dbUsersChangeStatusMsg).toHaveBeenCalled();
      expect(dbTransactions.commit).not.toHaveBeenCalled();
      expect(dbTransactions.abort).toHaveBeenCalled();
    }
  });
});
