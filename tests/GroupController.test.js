const expect = require('expect');

const errors = require('../helpers/errorstousers');
const success = require('../helpers/successtousers');

const GroupController = require('../controllers/GroupController');
const ControllerHelper = require('../controllers/ControllerHelper');

// For Mocking
const dbTransactions = require('../db/session');
const seqCounter = require('../db/sequencecounter');
const GroupUsers = require('../db/groupusers');
const GroupInfo = require('../db/groupinfo');
const GroupPolls = require('../db/grouppolls');

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

describe('create', () => {
  test('should exist', () => {
    // Expects
    expect(GroupController.create).toBeDefined();
  });

  test('should be a function', () => {
    // Expects
    expect(typeof GroupController.create).toBe('function');
  });

  test('should fail for invalid userid', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = '2004';
      const name = 'groupName';
      const desc = 'group desc';
      const userids = [2004, 2005];
      // Tests
      await GroupController.create(userid, name, desc, userids);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'userid\' must be a number');
    }
  });

  test('should fail for number name', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const name = 5151;
      const desc = 'group desc';
      const userids = [2004, 2005];
      // Tests
      await GroupController.create(userid, name, desc, userids);
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
      const desc = 'group desc';
      const userids = [2004, 2005];
      // Tests
      await GroupController.create(userid, name, desc, userids);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'name\' must be a nonEmptyString');
    }
  });

  test('should fail for number desc', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const name = 'group name';
      const desc = 37974;
      const userids = [2004, 2005];
      // Tests
      await GroupController.create(userid, name, desc, userids);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'desc\' must be a nonEmptyString');
    }
  });

  test('should fail for empty desc', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const name = 'group name';
      const desc = '';
      const userids = [2004, 2005];
      // Tests
      await GroupController.create(userid, name, desc, userids);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'desc\' must be a nonEmptyString');
    }
  });

  test('should fail for string array userids', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const name = 'group name';
      const desc = 'group desc';
      const userids = ['2004', '2005'];
      // Tests
      await GroupController.create(userid, name, desc, userids);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'userids\' must be a number[]');
    }
  });

  test('should fail for non-array userids', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const name = 'group name';
      const desc = 'group desc';
      const userids = 2005;
      // Tests
      await GroupController.create(userid, name, desc, userids);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'userids\' must be a number[]');
    }
  });

  test('should fail on error', async () => {
    // Mocks
    seqCounter.getNextValue = jest.fn(() => {
      throw new Error('');
    });
    expect.assertions(4);
    try {
      // Data
      const userid = 2004;
      const name = 'group name';
      const desc = 'group desc';
      const userids = [2004, 2005];
      // Tests
      await GroupController.create(userid, name, desc, userids);
    } catch (err) {
      // Expects
      expect(err.message).toContain(errors.internalError.message);
      expect(dbTransactions.start).toHaveBeenCalled();
      expect(dbTransactions.commit).not.toHaveBeenCalled();
      expect(dbTransactions.abort).toHaveBeenCalled();
    }
  });

  test('should create a group', async () => {
    // Mocks
    seqCounter.getNextValue = jest.fn(() => 30125);
    GroupInfo.create = jest.fn();
    GroupUsers.addUser = jest.fn();
    // Mock new Date()
    const DATE_TO_USE = new Date();
    const _Date = Date;
    global.Date = jest.fn(() => DATE_TO_USE);
    global.Date.UTC = _Date.UTC;
    global.Date.parse = _Date.parse;
    global.Date.now = _Date.now;
    // Data
    const userid = 2004;
    const name = 'group name';
    const desc = 'group desc';
    const userids = [2004, 2005];
    // Tests
    await GroupController.create(userid, name, desc, userids);
    // Expects
    expect(dbTransactions.start).toHaveBeenCalled();
    expect(dbTransactions.commit).toHaveBeenCalled();
    const groupData = {
      id: 30125,
      name: name,
      desc: desc,
      createdby: userid,
      time: new Date(), // Mock
    };
    expect(GroupInfo.create).toHaveBeenCalledWith(groupData);
    const adminData = {
      groupid: 30125,
      user_id: userid,
      addedby: userid,
      permission: 'ADMIN',
    };
    expect(GroupUsers.addUser).toHaveBeenCalledWith(adminData);

    userids.forEach((user) => {
      const memberData = {
        groupid: 30125,
        user_id: user,
        addedby: userid,
        permission: 'USER',
      };
      expect(GroupUsers.addUser).toHaveBeenCalledWith(memberData);
    });
    expect(dbTransactions.abort).not.toHaveBeenCalled();
  });
});

describe('changeTitle', () => {
  test('should exist', () => {
    // Expects
    expect(GroupController.changeTitle).toBeDefined();
  });

  test('should be a function', () => {
    // Expects
    expect(typeof GroupController.changeTitle).toBe('function');
  });

  test('should fail for invalid userid', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = '2004';
      const groupid = 3001;
      const name = 'group name';
      // Tests
      await GroupController.changeTitle(userid, groupid, name);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'userid\' must be a number');
    }
  });

  test('should fail for invalid groupid', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const groupid = '3001';
      const name = 'group name';
      // Tests
      await GroupController.changeTitle(userid, groupid, name);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'groupid\' must be a number');
    }
  });

  test('should fail for number name', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const groupid = 3001;
      const name = 45223;
      // Tests
      await GroupController.changeTitle(userid, groupid, name);
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
      const groupid = 3001;
      const name = '';
      // Tests
      await GroupController.changeTitle(userid, groupid, name);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'name\' must be a nonEmptyString');
    }
  });

  test('should fail if user is not a member of the group', async () => {
    // Mocks
    GroupUsers.isMember = jest.fn().mockImplementation(() => false);
    GroupInfo.changeTitle = jest.fn();
    expect.assertions(5);
    try {
      // Data
      const userid = 2004;
      const groupid = 3001;
      const name = 'group name';
      // Tests
      await GroupController.changeTitle(userid, groupid, name);
    } catch (err) {
      // Expects
      expect(err.message).toEqual(errors.errorUserIsNotMember.message);
      expect(GroupInfo.changeTitle).not.toHaveBeenCalled();
      expect(dbTransactions.start).not.toHaveBeenCalled();
      expect(dbTransactions.commit).not.toHaveBeenCalled();
      expect(dbTransactions.abort).toHaveBeenCalledWith(null);
    }
  });

  test('should change the desc of the group', async () => {
    // Mocks
    GroupUsers.isMember = jest.fn().mockImplementation(() => true);
    GroupInfo.changeTitle = jest.fn();
    ControllerHelper.informGroupUpdate = jest.fn();
    // Data
    const userid = 2004;
    const groupid = 3001;
    const name = 'group name';
    // Tests
    const reply = await GroupController.changeTitle(userid, groupid, name);
    // Expects
    const data = {
      groupid: groupid,
      name: name,
      changedby: userid,
    };
    const expectedReply = {
      status: success.groupTitleChanged,
    };
    expect(dbTransactions.start).toHaveBeenCalled();
    expect(GroupInfo.changeTitle).toHaveBeenCalledWith(data);
    expect(dbTransactions.commit).toHaveBeenCalled();
    expect(ControllerHelper.informGroupUpdate).toHaveBeenCalledWith(groupid);
    expect(reply).toEqual(expectedReply);
  });
});

describe('changeDesc', () => {
  test('should exist', () => {
    // Expects
    expect(GroupController.changeDesc).toBeDefined();
  });

  test('should be a function', () => {
    // Expects
    expect(typeof GroupController.changeDesc).toBe('function');
  });

  test('should fail for invalid userid', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = '2004';
      const groupid = 3001;
      const desc = 'group desc';
      // Tests
      await GroupController.changeDesc(userid, groupid, desc);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'userid\' must be a number');
    }
  });

  test('should fail for invalid groupid', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const groupid = '3001';
      const desc = 'group desc';
      // Tests
      await GroupController.changeDesc(userid, groupid, desc);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'groupid\' must be a number');
    }
  });

  test('should fail for number desc', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const groupid = 3001;
      const desc = 45223;
      // Tests
      await GroupController.changeDesc(userid, groupid, desc);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'desc\' must be a nonEmptyString');
    }
  });

  test('should fail for empty desc', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const groupid = 3001;
      const desc = '';
      // Tests
      await GroupController.changeDesc(userid, groupid, desc);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'desc\' must be a nonEmptyString');
    }
  });

  test('should fail if user is not a member of the group', async () => {
    // Mocks
    GroupUsers.isMember = jest.fn().mockImplementation(() => false);
    GroupInfo.changeDesc = jest.fn();
    expect.assertions(5);
    try {
      // Data
      const userid = 2004;
      const groupid = 3001;
      const desc = 'group desc';
      // Tests
      await GroupController.changeDesc(userid, groupid, desc);
    } catch (err) {
      // Expects
      expect(err.message).toEqual(errors.errorUserIsNotMember.message);
      expect(GroupInfo.changeDesc).not.toHaveBeenCalled();
      expect(dbTransactions.start).not.toHaveBeenCalled();
      expect(dbTransactions.commit).not.toHaveBeenCalled();
      expect(dbTransactions.abort).toHaveBeenCalledWith(null);
    }
  });

  test('should change the desc of the group', async () => {
    // Mocks
    GroupUsers.isMember = jest.fn().mockImplementation(() => true);
    GroupInfo.changeDesc = jest.fn();
    ControllerHelper.informGroupUpdate = jest.fn();
    // Data
    const userid = 2004;
    const groupid = 3001;
    const desc = 'group desc';
    // Tests
    const reply = await GroupController.changeDesc(userid, groupid, desc);
    // Expects
    const data = {
      groupid: groupid,
      desc: desc,
      changedby: userid,
    };
    const expectedReply = {
      status: success.groupDescChanged,
    };
    expect(dbTransactions.start).toHaveBeenCalled();
    expect(GroupInfo.changeDesc).toHaveBeenCalledWith(data);
    expect(dbTransactions.commit).toHaveBeenCalled();
    expect(ControllerHelper.informGroupUpdate).toHaveBeenCalledWith(groupid);
    expect(reply).toEqual(expectedReply);
  });
});

describe('getMyGroupsInfo', () => {
  test('should exist', () => {
    // Expects
    expect(GroupController.getMyGroupsInfo).toBeDefined();
  });

  test('should be a function', () => {
    // Expects
    expect(typeof GroupController.getMyGroupsInfo).toBe('function');
  });

  test('should fail for invalid userid', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = '2004';
      // Tests
      await GroupController.getMyGroupsInfo(userid);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'userid\' must be a number');
    }
  });

  test('should fail on error', async () => {
    GroupUsers.getGroupsOfUser = jest.fn()
        .mockImplementation(() => {
          throw new Error('');
        });
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      // Tests
      await GroupController.getMyGroupsInfo(userid);
    } catch (err) {
      // Expects
      expect(err.message).toContain(errors.internalError.message);
    }
  });

  test('should return group info', async () => {
    GroupUsers.getGroupsOfUser = jest.fn()
        .mockImplementation(() => [{groupid: 256}, {groupid: 8789}]);
    GroupInfo.getGroupsInfo = jest.fn();
    // Data
    const userid = 2004;
    // Tests
    await GroupController.getMyGroupsInfo(userid);
    expect(GroupInfo.getGroupsInfo).toHaveBeenCalledWith([256, 8789]);
  });

  test('should return nothing', async () => {
    GroupUsers.getGroupsOfUser = jest.fn()
        .mockImplementation(() => []);
    GroupInfo.getGroupsInfo = jest.fn();
    // Data
    const userid = 2004;
    // Tests
    const reply = await GroupController.getMyGroupsInfo(userid);
    expect(GroupInfo.getGroupsInfo).not.toHaveBeenCalled();
    expect(reply).toEqual([]);
  });
});

describe('getInfo', () => {
  test('should exist', () => {
    // Expects
    expect(GroupController.getInfo).toBeDefined();
  });

  test('should be a function', () => {
    // Expects
    expect(typeof GroupController.getInfo).toBe('function');
  });

  test('should fail for single string groupids', async () => {
    expect.assertions(1);
    try {
      // Data
      const groupids = '2004';
      // Tests
      await GroupController.getInfo(groupids);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'groupids\' must be number[]');
    }
  });

  test('should fail for single number groupids', async () => {
    expect.assertions(1);
    try {
      // Data
      const groupids = 2004;
      // Tests
      await GroupController.getInfo(groupids);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'groupids\' must be number[]');
    }
  });

  test('should fail for array of string in groupids', async () => {
    expect.assertions(1);
    try {
      // Data
      const groupids = ['2004', '2005'];
      // Tests
      await GroupController.getInfo(groupids);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'groupids\' must be number[]');
    }
  });

  test('should fail for array with empty string in groupids', async () => {
    expect.assertions(1);
    try {
      // Data
      const groupids = ['2004', ''];
      // Tests
      await GroupController.getInfo(groupids);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'groupids\' must be number[]');
    }
  });

  test('should fail on error', async () => {
    // Mocks
    GroupInfo.getGroupsInfo = jest.fn()
        .mockImplementation(() => {
          throw new Error('');
        });
    expect.assertions(1);
    try {
      // Data
      const groupids = [2004, 2005];
      // Tests
      await GroupController.getInfo(groupids);
    } catch (err) {
      // Expects
      expect(err.message).toContain(errors.internalError.message);
    }
  });

  test('should return group infos', async () => {
    // Mocks
    GroupInfo.getGroupsInfo = jest.fn();
    // Data
    const groupids = [2004, 2005];
    // Tests
    await GroupController.getInfo(groupids);
    // Expects
    expect(GroupInfo.getGroupsInfo).toBeCalledWith(groupids);
  });
});

describe('getPolls', () => {
  test('should exist', () => {
    // Expects
    expect(GroupController.getPolls).toBeDefined();
  });

  test('should be a function', () => {
    // Expects
    expect(typeof GroupController.getPolls).toBe('function');
  });

  test('should fail for invalid userid', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = '2004';
      const groupid = 3001;
      // Tests
      await GroupController.getPolls(userid, groupid);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'userid\' must be a number');
    }
  });

  test('should fail for invalid groupid', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const groupid = '3001';
      // Tests
      await GroupController.getPolls(userid, groupid);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'groupid\' must be a number');
    }
  });

  test('should fail if user is not a member of the group', async () => {
    // Mocks
    GroupUsers.isMember = jest.fn().mockImplementation(() => false);
    GroupPolls.getPolls = jest.fn();
    expect.assertions(2);
    try {
      // Data
      const userid = 2004;
      const groupid = 3001;
      // Tests
      await GroupController.getPolls(userid, groupid);
    } catch (err) {
      // Expects
      expect(err.message).toEqual(errors.errorUserIsNotMember.message);
      expect(GroupPolls.getPolls).not.toHaveBeenCalled();
    }
  });

  test('should fail on error', async () => {
    // Mocks
    GroupUsers.isMember = jest.fn()
        .mockImplementation(() => {
          throw new Error('');
        });
    GroupPolls.getPolls = jest.fn();
    expect.assertions(2);
    try {
      // Data
      const userid = 2004;
      const groupid = 3001;
      // Tests
      await GroupController.getPolls(userid, groupid);
    } catch (err) {
      // Expects
      expect(err.message).toContain(errors.internalError.message);
      expect(GroupPolls.getPolls).not.toHaveBeenCalled();
    }
  });

  test('should return polls', async () => {
    // Mocks
    GroupUsers.isMember = jest.fn().mockImplementation(() => true);
    GroupPolls.getPolls = jest.fn();
    // Data
    const userid = 2004;
    const groupid = 3001;
    // Tests
    await GroupController.getPolls(userid, groupid);
    expect(GroupPolls.getPolls).toHaveBeenCalled();
  });
});
