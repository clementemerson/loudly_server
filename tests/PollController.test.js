const expect = require('expect');
const testUtil = require('./testutil');

const redClient = require('../redis/redclient');
const mongo = require('../db/mongo');

const errors = require('../helpers/errorstousers');
const success = require('../helpers/successtousers');

const dbTransactions = require('../db/session');

// Testing
const PollController = require('../controllers/PollController');

// Dependents
const PollData = require('../db/polldata');
const GroupPolls = require('../db/grouppolls');
const VoteRegister = require('../db/pollvoteregister');
const GroupUsers = require('../db/groupusers');
const UserPolls = require('../db/userpolls');
const PollResult = require('../db/pollresult');
const PollVoteData = require('../db/pollvotedata');
const redHelper = require('../redis/redhelper');
const keyPrefix = require('../redis/key_prefix');
const connections = require('../websockets/connections');

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

describe('create', () => {
    testUtil.shouldExist(PollController.create);
    testUtil.shouldBeAFunction(PollController.create);
});

describe('vote', () => {
    testUtil.shouldExist(PollController.vote);
    testUtil.shouldBeAFunction(PollController.vote);

  test('should fail for invalid userid', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = '2004';
      const pollid = 1002;
      const option = 0;
      const secretVote = false;
      // Tests
      await PollController.vote(userid, pollid, option, secretVote);
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
      const option = 0;
      const secretVote = false;
      // Tests
      await PollController.vote(userid, pollid, option, secretVote);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'pollid\' must be a number');
    }
  });

  test('should fail for invalid option', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const pollid = 1002;
      const option = '0';
      const secretVote = false;
      // Tests
      await PollController.vote(userid, pollid, option, secretVote);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'option\' must be a number');
    }
  });

  test('should fail for invalid secretvote', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const pollid = 1002;
      const option = 0;
      const secretVote = 5;
      // Tests
      await PollController.vote(userid, pollid, option, secretVote);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'secretVote\' must be a boolean');
    }
  });

  test('should fail if poll does not exist', async () => {
    // Mocks
    PollData.getPollInfo = jest.fn().mockImplementation(() => null);
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const pollid = 1002;
      const option = 0;
      const secretVote = false;
      // Tests
      await PollController.vote(userid, pollid, option, secretVote);
    } catch (err) {
      // Expects
      expect(err.message).toContain(errors.errorPollNotAvailable.message);
    }
  });

  test('should fail if user has voted already', async () => {
    // Mocks
    PollData.getPollInfo = jest.fn().mockImplementation(() => {
      return {};
    });
    redClient.sismember = jest.fn().mockImplementation(() => true);
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const pollid = 1002;
      const option = 0;
      const secretVote = false;
      // Tests
      await PollController.vote(userid, pollid, option, secretVote);
    } catch (err) {
      // Expects
      expect(err.message).toContain(errors.errorUserAlreadyVoted.message);
    }
  });

  test('should fail on error', async () => {
    // Mocks
    PollData.getPollInfo = jest.fn().mockImplementation(() => {
      return {};
    });
    redClient.sismember = jest.fn().mockImplementation(() => false);
    VoteRegister.updatePollVoterList = jest.fn().mockImplementation(() => {
      throw new Error('');
    });
    expect.assertions(4);
    try {
      // Data
      const userid = 2004;
      const pollid = 1002;
      const option = 0;
      const secretVote = false;
      // Tests
      await PollController.vote(userid, pollid, option, secretVote);
    } catch (err) {
      // Expects
      expect(err.message).toContain(errors.internalError.message);
      expect(dbTransactions.start).toHaveBeenCalled();
      expect(dbTransactions.commit).not.toHaveBeenCalled();
      expect(dbTransactions.abort).toHaveBeenCalled();
    }
  });

  test('should pass - OpenVote', async () => {
    // Mocks
    const pollResult = {
      data: 101,
    };
    PollData.getPollInfo = jest.fn().mockImplementation(() => {
      return {};
    });
    redClient.sismember = jest.fn().mockImplementation(() => false);
    VoteRegister.updatePollVoterList = jest.fn();
    PollResult.updatePollResult = jest.fn();
    VoteRegister.updatePollVoterList = jest.fn();
    PollVoteData.saveVote = jest.fn();
    redHelper.updateOpenVoteResult = jest.fn();
    redHelper.updateSecretVoteResult = jest.fn();
    redClient.sadd = jest.fn();
    redHelper.getPollResult = jest.fn().mockImplementation(() => pollResult);
    connections.inform = jest.fn();
    // Data
    const userid = 2004;
    const pollid = 1002;
    const option = 0;
    const secretVote = false;
    // Tests
    const reply = await PollController.vote(userid, pollid, option, secretVote);
    // Expects
    const data = {
      pollid: pollid,
      user_id: userid,
      optionindex: option,
      secretvote: secretVote,
    };
    // For saving votes
    expect(PollResult.updatePollResult).toHaveBeenCalledWith(data);
    expect(VoteRegister.updatePollVoterList).toHaveBeenCalledWith(data);
    expect(PollVoteData.saveVote).toHaveBeenCalledWith(data);
    // For frequent access
    expect(redClient.sadd).toHaveBeenCalledWith(
        keyPrefix.pollVotedUsers + pollid,
        userid
    );
    expect(redClient.sadd).toHaveBeenCalledWith(keyPrefix.pollUpdates, pollid);
    // Transactions
    expect(dbTransactions.start).toHaveBeenCalled();
    expect(dbTransactions.commit).toHaveBeenCalled();
    expect(dbTransactions.abort).not.toHaveBeenCalled();
    // Inform Result
    expect(redHelper.getPollResult).toHaveBeenCalledWith(pollid);
    expect(connections.inform).toHaveBeenCalledWith(userid, pollResult);
    // Result
    const expectedResult = {
      pollid: pollid,
      status: success.successVoted,
    };
    expect(reply).toEqual(expectedResult);
  });

  test('should pass - SecretVote', async () => {
    // Mocks
    const pollResult = {
      data: 101,
    };
    PollData.getPollInfo = jest.fn().mockImplementation(() => {
      return {};
    });
    redClient.sismember = jest.fn().mockImplementation(() => false);
    VoteRegister.updatePollVoterList = jest.fn();
    PollResult.updatePollResult = jest.fn();
    VoteRegister.updatePollVoterList = jest.fn();
    PollVoteData.saveVote = jest.fn();
    redHelper.updateOpenVoteResult = jest.fn();
    redHelper.updateSecretVoteResult = jest.fn();
    redClient.sadd = jest.fn();
    redHelper.getPollResult = jest.fn().mockImplementation(() => pollResult);
    connections.inform = jest.fn();
    // Data
    const userid = 2004;
    const pollid = 1002;
    const option = 0;
    const secretVote = true;
    // Tests
    const reply = await PollController.vote(userid, pollid, option, secretVote);
    // Expects
    const data = {
      pollid: pollid,
      user_id: userid,
      optionindex: option,
      secretvote: secretVote,
    };
    // For saving votes
    expect(PollResult.updatePollResult).toHaveBeenCalledWith(data);
    expect(VoteRegister.updatePollVoterList).toHaveBeenCalledWith(data);
    expect(PollVoteData.saveVote).toHaveBeenCalledWith(data);
    // For frequent access
    expect(redClient.sadd).toHaveBeenCalledWith(
        keyPrefix.pollVotedUsers + pollid,
        userid
    );
    expect(redClient.sadd).toHaveBeenCalledWith(keyPrefix.pollUpdates, pollid);
    // Transactions
    expect(dbTransactions.start).toHaveBeenCalled();
    expect(dbTransactions.commit).toHaveBeenCalled();
    expect(dbTransactions.abort).not.toHaveBeenCalled();
    // Inform Result
    expect(redHelper.getPollResult).toHaveBeenCalledWith(pollid);
    expect(connections.inform).toHaveBeenCalledWith(userid, pollResult);
    // Result
    const expectedResult = {
      pollid: pollid,
      status: success.successVoted,
    };
    expect(reply).toEqual(expectedResult);
  });
});

describe('getMyPollsInfo', () => {
    testUtil.shouldExist(PollController.getMyPollsInfo);
    testUtil.shouldBeAFunction(PollController.getMyPollsInfo);

  test('should fail for invalid userid', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = '2004';
      // Tests
      await PollController.getMyPollsInfo(userid);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'userid\' must be a number');
    }
  });

  test('should fail on error', async () => {
    // Mocks
    GroupUsers.getGroupsOfUser = jest.fn().mockImplementation(() => {
      throw new Error('');
    });
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      // Tests
      await PollController.getMyPollsInfo(userid);
    } catch (err) {
      // Expects
      expect(err.message).toContain(errors.internalError.message);
    }
  });

  test('should pass', async () => {
    // Mocks
    const expectedResult = {
      data: 101,
    };
    GroupUsers.getGroupsOfUser = jest
        .fn()
        .mockImplementation(() => [3010, 3011]);
    GroupPolls.getPolls = jest
        .fn()
        .mockImplementation(() => [{pollid: 1002}, {pollid: 1006}]);
    UserPolls.getPolls = jest
        .fn()
        .mockImplementation(() => [{pollid: 1008}, {pollid: 1006}]);
    PollData.getPollInfoByPollIds = jest
        .fn()
        .mockImplementation(() => expectedResult);
    // Data
    const userid = 2004;
    // Tests
    const reply = await PollController.getMyPollsInfo(userid);
    // Expects
    expect(reply).toEqual(expectedResult);
  });
});

describe('getInfo', () => {
    testUtil.shouldExist(PollController.getInfo);
    testUtil.shouldBeAFunction(PollController.getInfo);

  test('should fail for invalid userid', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = '2004';
      const pollids = [1002, 1005];
      // Tests
      await PollController.getInfo(userid, pollids);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'userid\' must be a number');
    }
  });

  test('should fail for string array pollids', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const pollids = ['1002', '1005'];
      // Tests
      await PollController.getInfo(userid, pollids);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'pollids\' must be a number[]');
    }
  });

  test('should fail for non array pollids', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const pollids = 1005;
      // Tests
      await PollController.getInfo(userid, pollids);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'pollids\' must be a number[]');
    }
  });

  test('should fail on error', async () => {
    // Mocks
    PollData.getPollInfoByPollIds = jest.fn().mockImplementation(() => {
      throw new Error('');
    });
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const pollids = [1002, 1005];
      // Tests
      await PollController.getInfo(userid, pollids);
    } catch (err) {
      // Expects
      expect(err.message).toContain(errors.internalError.message);
    }
  });

  test('should pass', async () => {
    // Mocks
    const expectedResult = {
      data: 101,
    };
    PollData.getPollInfoByPollIds = jest
        .fn()
        .mockImplementation(() => expectedResult);
    // Data
    const userid = 2004;
    const pollids = [1002, 1005];
    // Tests
    const reply = await PollController.getInfo(userid, pollids);
    expect(reply).toEqual(expectedResult);
  });
});

describe('delete', () => {
    testUtil.shouldExist(PollController.delete);
    testUtil.shouldBeAFunction(PollController.delete);

  test('should fail for invalid userid', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = '2004';
      const pollid = 1002;
      // Tests
      await PollController.delete(userid, pollid);
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
      await PollController.delete(userid, pollid);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'pollid\' must be a number');
    }
  });

  test('should fail if user is not the creator', async () => {
    // Mocks
    PollData.isCreator = jest.fn().mockImplementation(() => false);
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const pollid = 1002;
      // Tests
      await PollController.delete(userid, pollid);
    } catch (err) {
      // Expects
      expect(err.message).toContain(errors.errorUserNotCreatorOfPoll.message);
    }
  });

  test('should fail if the poll is already shared to a group', async () => {
    // Mocks
    PollData.isCreator = jest.fn().mockImplementation(() => true);
    GroupPolls.getGroupsOfPoll = jest.fn().mockImplementation(() => [3010]);
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const pollid = 1002;
      // Tests
      await PollController.delete(userid, pollid);
    } catch (err) {
      // Expects
      expect(err.message).toContain(errors.errorPollSharedToGroup.message);
    }
  });

  test('should fail if someone casted vote already', async () => {
    // Mocks
    PollData.isCreator = jest.fn().mockImplementation(() => true);
    GroupPolls.getGroupsOfPoll = jest.fn().mockImplementation(() => []);
    VoteRegister.getVotersList = jest
        .fn()
        .mockImplementation(() => [2004, 2005]);
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const pollid = 1002;
      // Tests
      await PollController.delete(userid, pollid);
    } catch (err) {
      // Expects
      expect(err.message).toContain(errors.errorPollVoteCasted.message);
    }
  });

  test('should fail on error', async () => {
    // Mocks
    PollData.isCreator = jest.fn().mockImplementation(() => true);
    GroupPolls.getGroupsOfPoll = jest.fn().mockImplementation(() => []);
    VoteRegister.getVotersList = jest.fn().mockImplementation(() => [2005]);
    PollData.delete = jest.fn().mockImplementation(() => {
      throw new Error('');
    });
    expect.assertions(4);
    try {
      // Data
      const userid = 2004;
      const pollid = 1002;
      // Tests
      await PollController.delete(userid, pollid);
    } catch (err) {
      // Expects
      expect(err.message).toContain(errors.internalError.message);
      expect(dbTransactions.start).toHaveBeenCalled();
      expect(dbTransactions.commit).not.toHaveBeenCalled();
      expect(dbTransactions.abort).toHaveBeenCalled();
    }
  });

  test('should pass', async () => {
    // Mocks
    PollData.isCreator = jest.fn().mockImplementation(() => true);
    GroupPolls.getGroupsOfPoll = jest.fn().mockImplementation(() => []);
    VoteRegister.getVotersList = jest.fn().mockImplementation(() => [2005]);
    PollData.delete = jest.fn();
    // Data
    const userid = 2004;
    const pollid = 1002;
    // Tests
    const reply = await PollController.delete(userid, pollid);
    const expectedReply = {
      pollid: pollid,
      status: success.successPollDeleted,
    };
    // Expects
    expect(reply).toEqual(expectedReply);
    expect(PollData.delete).toHaveBeenCalledWith(pollid);
    expect(dbTransactions.start).toHaveBeenCalled();
    expect(dbTransactions.commit).toHaveBeenCalled();
    expect(dbTransactions.abort).not.toHaveBeenCalled();
  });
});
