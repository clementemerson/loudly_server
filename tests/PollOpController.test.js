const expect = require('expect');

const redClient = require('../redis/redclient');
const mongo = require('../db/mongo');

const errors = require('../helpers/errorstousers');

const dbTransactions = require('../db/session');

const PollOpController = require('../controllers/PollOpController');

// Dependents
const PollVoteData = require('../db/pollvotedata');
const UserPolls = require('../db/userpolls');
const GroupUsers = require('../db/groupusers');
const GroupPolls = require('../db/grouppolls');

beforeAll(async () => {
  await redClient.initRedisClient('loudly.loudspeakerdev.net', 6379, 5);
  await mongo.initDbConnection();
  console.log = () => {};
});

beforeEach(() => {
  dbTransactions.start = jest.fn();
  dbTransactions.commit = jest.fn();
  dbTransactions.abort = jest.fn();
});

afterEach(() => {});

afterAll(() => {});

describe('shareToGroup', () => {
  test('should exist', () => {
    // Expects
    expect(PollOpController.shareToGroup).toBeDefined();
  });

  test('should be a function', () => {
    // Expects
    expect(typeof PollOpController.shareToGroup).toBe('function');
  });

  test('should fail for invalid userid', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = '2004';
      const pollid = 1002;
      const groupids = [3010, 3011];
      // Tests
      await PollOpController.shareToGroup(userid, pollid, groupids);
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
      const groupids = [3010, 3011];
      // Tests
      await PollOpController.shareToGroup(userid, pollid, groupids);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'pollid\' must be a number');
    }
  });

  test('should fail for invalid array groupids', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const pollid = 1002;
      const groupids = ['3010', 3011];
      // Tests
      await PollOpController.shareToGroup(userid, pollid, groupids);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'groupids\' must be a number[]');
    }
  });

  test('should fail for non-array groupids', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const pollid = 1002;
      const groupids = 3010;
      // Tests
      await PollOpController.shareToGroup(userid, pollid, groupids);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'groupids\' must be a number[]');
    }
  });

  test('should fail if the user does not have the poll', async () => {
    // Mocks
    UserPolls.userHasPoll = jest.fn().mockImplementation(() => false);
    expect.assertions(4);
    try {
      // Data
      const userid = 2004;
      const pollid = 1002;
      const groupids = [3010, 3011];
      // Tests
      await PollOpController.shareToGroup(userid, pollid, groupids);
    } catch (err) {
      // Expects
      expect(err.message).toEqual(errors.errorUserDoesNotHavePoll.message);
      expect(dbTransactions.start).not.toHaveBeenCalled();
      expect(dbTransactions.commit).not.toHaveBeenCalled();
      expect(dbTransactions.abort).toHaveBeenCalledWith(null);
    }
  });

  test('should fail if the user is not a member of the groups', async () => {
    // Mocks
    UserPolls.userHasPoll = jest.fn().mockImplementation(() => true);
    GroupUsers.isMember = jest.fn().mockImplementation(() => false);
    expect.assertions(4);
    try {
      // Data
      const userid = 2004;
      const pollid = 1002;
      const groupids = [3010, 3011];
      // Tests
      await PollOpController.shareToGroup(userid, pollid, groupids);
    } catch (err) {
      // Expects
      expect(err.message).toEqual(errors.errorNoGroupsToShare.message);
      expect(dbTransactions.start).not.toHaveBeenCalled();
      expect(dbTransactions.commit).not.toHaveBeenCalled();
      expect(dbTransactions.abort).toHaveBeenCalledWith(null);
    }
  });

  test('should fail if all the groups have the poll already', async () => {
    // Mocks
    UserPolls.userHasPoll = jest.fn().mockImplementation(() => true);
    GroupUsers.isMember = jest.fn().mockImplementation(() => true);
    GroupPolls.groupHasPoll = jest.fn().mockImplementation(() => true);
    expect.assertions(4);
    try {
      // Data
      const userid = 2004;
      const pollid = 1002;
      const groupids = [3010, 3011];
      // Tests
      await PollOpController.shareToGroup(userid, pollid, groupids);
    } catch (err) {
      // Expects
      expect(err.message).toEqual(errors.errorNoGroupsToShare.message);
      expect(dbTransactions.start).not.toHaveBeenCalled();
      expect(dbTransactions.commit).not.toHaveBeenCalled();
      expect(dbTransactions.abort).toHaveBeenCalledWith(null);
    }
  });

  test('should fail on error', async () => {
    // Mocks
    UserPolls.userHasPoll = jest.fn().mockImplementation(() => true);
    GroupUsers.isMember = jest.fn().mockImplementation(() => true);
    GroupPolls.groupHasPoll = jest.fn().mockImplementation(() => false);
    GroupPolls.shareToGroup = jest.fn().mockImplementation(() => {
      throw new Error('');
    });
    try {
      // Data
      const userid = 2004;
      const pollid = 1002;
      const groupids = [3010, 3011];
      // Tests
      await PollOpController.shareToGroup(userid, pollid, groupids);
    } catch (err) {
      expect(err.message).toContain(errors.internalError.message);
      expect(dbTransactions.start).toHaveBeenCalled();
      expect(dbTransactions.commit).not.toHaveBeenCalled();
      expect(dbTransactions.abort).toHaveBeenCalled();
    }
  });

  test('should pass - shared to all groups', async () => {
    // Mocks
    UserPolls.userHasPoll = jest.fn().mockImplementation(() => true);
    GroupUsers.isMember = jest.fn().mockImplementation(() => true);
    GroupPolls.groupHasPoll = jest.fn().mockImplementation(() => false);
    GroupPolls.shareToGroup = jest.fn();
    // Data
    const userid = 2004;
    const pollid = 1002;
    const groupids = [3010, 3011];
    // Tests
    await PollOpController.shareToGroup(userid, pollid, groupids);
    groupids.forEach((groupid) => {
      const data = {
        pollid: pollid,
        groupid: groupid,
        user_id: userid,
      };
      expect(GroupPolls.shareToGroup).toHaveBeenCalledWith(data);
    });
    expect(dbTransactions.start).toHaveBeenCalled();
    expect(dbTransactions.commit).toHaveBeenCalled();
    expect(dbTransactions.abort).not.toHaveBeenCalled();
  });

  test('should pass - shared to a subset of groups', async () => {
    // Mocks
    const groupPolls = [3010];
    UserPolls.userHasPoll = jest.fn().mockImplementation(() => true);
    GroupUsers.isMember = jest.fn().mockImplementation(() => true);
    GroupPolls.groupHasPoll = jest
        .fn()
        .mockImplementation((pollid, groupid) => {
          if (groupPolls.indexOf(groupid) >= 0) {
            return true;
          }
          return false;
        });
    GroupPolls.shareToGroup = jest.fn();
    // Data
    const userid = 2004;
    const pollid = 1002;
    const groupids = [3010, 3011];
    // Inference
    const groupidsToShare = [3011];
    const groupidsNotToShare = [3010];
    // Tests
    await PollOpController.shareToGroup(userid, pollid, groupids);
    // Expects
    groupidsToShare.forEach((groupid) => {
      const data = {
        pollid: pollid,
        groupid: groupid,
        user_id: userid,
      };
      expect(GroupPolls.shareToGroup).toHaveBeenCalledWith(data);
    });
    expect(dbTransactions.start).toHaveBeenCalled();
    expect(dbTransactions.commit).toHaveBeenCalled();
    expect(dbTransactions.abort).not.toHaveBeenCalled();

    groupidsNotToShare.forEach((groupid) => {
      const data = {
        pollid: pollid,
        groupid: groupid,
        user_id: userid,
      };
      expect(GroupPolls.shareToGroup).not.toHaveBeenCalledWith(data);
    });
  });
});

describe('getUsersVotesByPoll', () => {
  test('should exist', () => {
    // Expects
    expect(PollOpController.getUsersVotesByPoll).toBeDefined();
  });

  test('should be a function', () => {
    // Expects
    expect(typeof PollOpController.getUsersVotesByPoll).toBe('function');
  });

  test('should fail for invalid userid', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = '2004';
      const pollid = 1002;
      const userids = [2010, 2015];
      // Tests
      await PollOpController.getUsersVotesByPoll(userid, pollid, userids);
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
      const userids = [2010, 2015];
      // Tests
      await PollOpController.getUsersVotesByPoll(userid, pollid, userids);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'pollid\' must be a number');
    }
  });

  test('should fail for invalid array userids', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const pollid = 1002;
      const userids = ['2010', 2015];
      // Tests
      await PollOpController.getUsersVotesByPoll(userid, pollid, userids);
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
      const pollid = 1002;
      const userids = 3010;
      // Tests
      await PollOpController.getUsersVotesByPoll(userid, pollid, userids);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'userids\' must be a number[]');
    }
  });

  test('should fail if user is not a member of the poll', async () => {
    // Mock
    UserPolls.userHasPoll = jest.fn().mockImplementation(() => false);
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const pollid = 1002;
      const userids = [2010, 2015];
      // Tests
      await PollOpController.getUsersVotesByPoll(userid, pollid, userids);
    } catch (err) {
      // Expects
      expect(err.message).toEqual(errors.errorUserDoesNotHavePoll.message);
    }
  });

  test('should fail on error', async () => {
    // Mock
    UserPolls.userHasPoll = jest.fn().mockImplementation(() => true);
    PollVoteData.getUsersVotesByPoll = jest.fn().mockImplementation(() => {
      throw new Error('');
    });
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const pollid = 1002;
      const userids = [2010, 2015];
      // Tests
      await PollOpController.getUsersVotesByPoll(userid, pollid, userids);
    } catch (err) {
      // Expects
      expect(err.message).toContain(errors.internalError.message);
    }
  });

  test('should pass', async () => {
    // Mock
    const expectedResult = {
      data: 101,
    };
    UserPolls.userHasPoll = jest.fn().mockImplementation(() => true);
    PollVoteData.getUsersVotesByPoll = jest
        .fn()
        .mockImplementation(() => expectedResult);
    // Data
    const userid = 2004;
    const pollid = 1002;
    const userids = [2010, 2015];
    // Tests
    const reply = await PollOpController.getUsersVotesByPoll(
        userid,
        pollid,
        userids
    );
    // Expects
    expect(reply).toEqual(expectedResult);
  });
});

describe('getMyVotes', () => {
  test('should exist', () => {
    // Expects
    expect(PollOpController.getMyVotes).toBeDefined();
  });

  test('should be a function', () => {
    // Expects
    expect(typeof PollOpController.getMyVotes).toBe('function');
  });

  test('should fail for invalid userid', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = '2004';
      // Tests
      await PollOpController.getMyVotes(userid);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'userid\' must be a number');
    }
  });

  test('should fail on error', async () => {
    // Mock
    PollVoteData.getMyVotes = jest.fn().mockImplementation(() => {
      throw new Error('');
    });
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      // Tests
      await PollOpController.getMyVotes(userid);
    } catch (err) {
      // Expects
      expect(err.message).toContain(errors.internalError.message);
    }
  });

  test('should be success for valid user id', async () => {
    // Mock
    const expectedResult = {
      data: 101,
    };
    PollVoteData.getMyVotes = jest
        .fn()
        .mockImplementation(() => expectedResult);
    // Data
    const userid = 2004;
    // Tests
    const reply = await PollOpController.getMyVotes(userid);
    // Expects
    expect(PollVoteData.getMyVotes).toHaveBeenCalledWith(userid);
    expect(reply).toEqual(expectedResult);
  });
});
