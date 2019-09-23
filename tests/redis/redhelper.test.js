const expect = require('expect');
const testUtil = require('../../testutil/testUtil');

// Testing
const redHelper = require('../../redis/redhelper');

// Dependents
const redClient = require('../../redis/redclient');
const keyPrefix = require('../../redis/key_prefix');

beforeAll(async () => {
    console.log = () => { };
});

beforeEach(() => { });

afterEach(() => { });

afterAll(() => { });

describe('createUser', () => {
    testUtil.shouldExist(redHelper.createUser);
    testUtil.shouldBeAFunction(redHelper.createUser);
    
    test('should fail for invalid userid', async () => {
        expect.assertions(1);
        try {
            // Data
            const userid = '2004';
            const phoneNumber = '9884386484';
            // Tests
            await redHelper.createUser(userid, phoneNumber);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'userid\' must be a number');
        }
    });

    test('should fail for invalid phonenumber', async () => {
        expect.assertions(1);
        try {
            // Data
            const userid = 2004;
            const phoneNumber = 9884386484;
            // Tests
            await redHelper.createUser(userid, phoneNumber);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'phoneNumber\' must be a string');
        }
    });

    test('should pass', async () => {
        // Mocks
        redClient.hmset = jest.fn();
        // Data
        const userid = 2004;
        const phoneNumber = '9884386484';
        // Tests
        await redHelper.createUser(userid, phoneNumber);
        // Expects
        expect(redClient.hmset).toHaveBeenCalledWith(
            keyPrefix.phoneNumber + phoneNumber,
            'id',
            userid
        );
    });
});

describe('addGroupUser', () => {
    testUtil.shouldExist(redHelper.addGroupUser);
    testUtil.shouldBeAFunction(redHelper.addGroupUser);

    test('should fail for invalid userid', async () => {
        expect.assertions(1);
        try {
            // Data
            const userid = '2004';
            const groupid = 3010;
            // Tests
            await redHelper.addGroupUser(groupid, userid);
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
            const groupid = '98843';
            // Tests
            await redHelper.addGroupUser(groupid, userid);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'groupid\' must be a number');
        }
    });

    test('should pass', async () => {
        // Mocks
        redClient.exists = jest.fn().mockImplementation(() => 1);
        redClient.sadd = jest.fn();
        // Data
        const userid = 2004;
        const groupid = 3010;
        // Tests
        await redHelper.addGroupUser(groupid, userid);
        // Expects
        expect(redClient.sadd).toHaveBeenCalledWith(
            keyPrefix.usersOfGroup + groupid,
            userid
        );
    });
});

describe('createPollResult', () => {
    testUtil.shouldExist(redHelper.createPollResult);
    testUtil.shouldBeAFunction(redHelper.createPollResult);
});

describe('updateOpenVoteResult', () => {
    testUtil.shouldExist(redHelper.updateOpenVoteResult);
    testUtil.shouldBeAFunction(redHelper.updateOpenVoteResult);

    test('should fail for invalid pollid', async () => {
        expect.assertions(1);
        try {
            // Data
            const pollid = '2004';
            const optionindex = 0;
            // Tests
            await redHelper.updateOpenVoteResult(pollid, optionindex);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'pollid\' must be a number');
        }
    });

    test('should fail for invalid optionindex', async () => {
        expect.assertions(1);
        try {
            // Data
            const pollid = 2004;
            const optionindex = '0';
            // Tests
            await redHelper.updateOpenVoteResult(pollid, optionindex);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'optionindex\' must be a number');
        }
    });

    test('should pass', async () => {
        // Mocks
        redClient.hincrby = jest.fn();
        // Data
        const pollid = 2004;
        const optionindex = 0;
        // Tests
        await redHelper.updateOpenVoteResult(pollid, optionindex);
        // Expects
        expect(redClient.hincrby).toHaveBeenCalledWith(
            keyPrefix.pollResult + pollid,
            'OV' + optionindex.toString(),
            1
        );
    });
});

describe('updateSecretVoteResult', () => {
    testUtil.shouldExist(redHelper.updateSecretVoteResult);
    testUtil.shouldBeAFunction(redHelper.updateSecretVoteResult);

    test('should fail for invalid pollid', async () => {
        expect.assertions(1);
        try {
            // Data
            const pollid = '2004';
            const optionindex = 0;
            // Tests
            await redHelper.updateSecretVoteResult(pollid, optionindex);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'pollid\' must be a number');
        }
    });

    test('should fail for invalid optionindex', async () => {
        expect.assertions(1);
        try {
            // Data
            const pollid = 2004;
            const optionindex = '0';
            // Tests
            await redHelper.updateSecretVoteResult(pollid, optionindex);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'optionindex\' must be a number');
        }
    });

    test('should pass', async () => {
        // Mocks
        redClient.hincrby = jest.fn();
        // Data
        const pollid = 2004;
        const optionindex = 0;
        // Tests
        await redHelper.updateSecretVoteResult(pollid, optionindex);
        // Expects
        expect(redClient.hincrby).toHaveBeenCalledWith(
            keyPrefix.pollResult + pollid,
            'SV' + optionindex.toString(),
            1
        );
    });
});

describe('getUserIdsByPhone', () => {
    testUtil.shouldExist(redHelper.getUserIdsByPhone);
    testUtil.shouldBeAFunction(redHelper.getUserIdsByPhone);

    test('should fail for non-array phoneNumbers', async () => {
        expect.assertions(1);
        try {
            // Data
            const phoneNumbers = '12156515';
            // Tests
            await redHelper.getUserIdsByPhone(phoneNumbers);
        } catch (err) {
            // Expects
            expect(err.message).toEqual(
                'argument \'phoneNumbers\' must be a nonEmptyString[]'
            );
        }
    });

    test('should fail for non-string array phoneNumbers', async () => {
        expect.assertions(1);
        try {
            // Data
            const phoneNumbers = ['1545151215', 515511];
            // Tests
            await redHelper.getUserIdsByPhone(phoneNumbers);
        } catch (err) {
            // Expects
            expect(err.message).toEqual(
                'argument \'phoneNumbers\' must be a nonEmptyString[]'
            );
        }
    });

    test('should fail for empty phoneNumbers', async () => {
        expect.assertions(1);
        try {
            // Data
            const phoneNumbers = ['1545151215', ''];
            // Tests
            await redHelper.getUserIdsByPhone(phoneNumbers);
        } catch (err) {
            // Expects
            expect(err.message).toEqual(
                'argument \'phoneNumbers\' must be a nonEmptyString[]'
            );
        }
    });

    test('should pass', async () => {
        // Mocks
        redClient.multiget = jest.fn();
        // Data
        const phoneNumbers = ['1545151215', '19846216'];
        // Tests
        await redHelper.getUserIdsByPhone(phoneNumbers);
        // Expects
        expect(redClient.multiget).toHaveBeenCalledWith(
            keyPrefix.phoneNumber,
            phoneNumbers
        );
    });
});

describe('getPollResults', () => {
    testUtil.shouldExist(redHelper.getPollResults);
    testUtil.shouldBeAFunction(redHelper.getPollResults);

    test('should fail for non-array pollids', async () => {
        expect.assertions(1);
        try {
            // Data
            const pollids = '12156515';
            // Tests
            await redHelper.getPollResults(pollids);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'pollids\' must be a number[]');
        }
    });

    test('should fail for non-number array phoneNumbers', async () => {
        expect.assertions(1);
        try {
            // Data
            const pollids = ['514651', '148515'];
            // Tests
            await redHelper.getPollResults(pollids);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'pollids\' must be a number[]');
        }
    });

    test('should pass', async () => {
        // Mocks
        redClient.multiget = jest.fn();
        // Data
        const pollids = [1002, 1006];
        // Tests
        await redHelper.getPollResults(pollids);
        // Expects
        expect(redClient.multiget).toHaveBeenCalledWith(
            keyPrefix.pollResult,
            pollids
        );
    });
});

describe('getPollResult', () => {
    testUtil.shouldExist(redHelper.getPollResult);
    testUtil.shouldBeAFunction(redHelper.getPollResult);

    test('should fail for invalid pollid', async () => {
        expect.assertions(1);
        try {
            // Data
            const pollid = '2004';
            // Tests
            await redHelper.getPollResult(pollid);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'pollid\' must be a number');
        }
    });

    test('should pass', async () => {
        // Mocks
        redClient.hgetall = jest.fn();
        // Data
        const pollid = 1005;
        // Tests
        await redHelper.getPollResult(pollid);
        // Expects
        expect(redClient.hgetall).toHaveBeenCalledWith(
            keyPrefix.pollResult + pollid
        );
    });
});

describe('getSubscribedUsers', () => {
    testUtil.shouldExist(redHelper.createUser);
    testUtil.shouldBeAFunction(redHelper.createUser);

    test('should fail for invalid pollid', async () => {
        expect.assertions(1);
        try {
            // Data
            const pollid = '2004';
            // Tests
            await redHelper.getSubscribedUsers(pollid);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'pollid\' must be a number');
        }
    });

    test('should pass', async () => {
        // Mocks
        redClient.zrangebyscore = jest.fn();
        // Data
        const pollid = 1005;
        // Tests
        await redHelper.getSubscribedUsers(pollid);
        // Expects
        expect(redClient.zrangebyscore).toHaveBeenCalledWith(
            keyPrefix.pollSubsription + pollid,
            '-inf',
            '+inf'
        );
    });
});

describe('getSubscribedUsersUntilTime', () => {
    testUtil.shouldExist(redHelper.getSubscribedUsersUntilTime);
    testUtil.shouldBeAFunction(redHelper.getSubscribedUsersUntilTime);

    test('should fail for invalid pollid', async () => {
        expect.assertions(1);
        try {
            // Data
            const pollid = '2004';
            const timeUntilSubscriptionMade = 165498461;
            // Tests
            await redHelper.getSubscribedUsersUntilTime(
                pollid,
                timeUntilSubscriptionMade
            );
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'pollid\' must be a number');
        }
    });

    test('should fail for invalid timeUntilSubscriptionMade', async () => {
        expect.assertions(1);
        try {
            // Data
            const pollid = 2004;
            const timeUntilSubscriptionMade = '165498461';
            // Tests
            await redHelper.getSubscribedUsersUntilTime(
                pollid,
                timeUntilSubscriptionMade
            );
        } catch (err) {
            // Expects
            expect(err.message).toEqual(
                'argument \'timeUntilSubscriptionMade\' must be a number'
            );
        }
    });

    test('should pass', async () => {
        // Mocks
        redClient.zrangebyscore = jest.fn();
        // Data
        const pollid = 1005;
        const timeUntilSubscriptionMade = 165498461;
        // Tests
        await redHelper.getSubscribedUsersUntilTime(
            pollid,
            timeUntilSubscriptionMade
        );
        // Expects
        expect(redClient.zrangebyscore).toHaveBeenCalledWith(
            keyPrefix.pollSubsription + pollid,
            '-inf',
            timeUntilSubscriptionMade
        );
    });
});

describe('removeElapsedSubscriptions', () => {
    testUtil.shouldExist(redHelper.removeElapsedSubscriptions);
    testUtil.shouldBeAFunction(redHelper.removeElapsedSubscriptions);

    test('should fail for invalid pollid', async () => {
        expect.assertions(1);
        try {
            // Data
            const pollid = '2004';
            const timeUntilSubscriptionMade = 165498461;
            // Tests
            await redHelper.removeElapsedSubscriptions(
                pollid,
                timeUntilSubscriptionMade
            );
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'pollid\' must be a number');
        }
    });

    test('should fail for invalid timeUntilSubscriptionMade', async () => {
        expect.assertions(1);
        try {
            // Data
            const pollid = 2004;
            const timeUntilSubscriptionMade = '165498461';
            // Tests
            await redHelper.removeElapsedSubscriptions(
                pollid,
                timeUntilSubscriptionMade
            );
        } catch (err) {
            // Expects
            expect(err.message).toEqual(
                'argument \'timeUntilSubscriptionMade\' must be a number'
            );
        }
    });

    test('should pass', async () => {
        // Mocks
        redClient.zremrangebyscore = jest.fn();
        // Data
        const pollid = 1005;
        const timeUntilSubscriptionMade = 165498461;
        // Tests
        await redHelper.removeElapsedSubscriptions(
            pollid,
            timeUntilSubscriptionMade
        );
        // Expects
        expect(redClient.zremrangebyscore).toHaveBeenCalledWith(
            keyPrefix.pollSubsription + pollid,
            '-inf',
            timeUntilSubscriptionMade
        );
    });
});
