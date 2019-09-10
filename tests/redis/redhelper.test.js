const expect = require('expect');

//Testing
const redHelper = require('../../redis/redhelper');

//Dependents
const redClient = require('../../redis/redclient');
const keyPrefix = require('../../redis/key_prefix');

beforeAll(async () => {
    console.log = () => { };
});

beforeEach(() => {
});

afterEach(() => {
});

afterAll(() => {
});

describe('createUser', () => {
    test('should exist', () => {
        // Expects
        expect(redHelper.createUser).toBeDefined();
    });

    test('should be a function', () => {
        // Expects
        expect(typeof redHelper.createUser).toBe('function');
    });

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
        //Mocks
        redClient.hmset = jest.fn();
        // Data
        const userid = 2004;
        const phoneNumber = '9884386484';
        // Tests
        await redHelper.createUser(userid, phoneNumber);
        // Expects
        expect(redClient.hmset).toHaveBeenCalledWith(keyPrefix.phoneNumber + phoneNumber, 'id', userid)
    });
});

describe('addGroupUser', () => {
    test('should exist', () => {
        // Expects
        expect(redHelper.addGroupUser).toBeDefined();
    });

    test('should be a function', () => {
        // Expects
        expect(typeof redHelper.addGroupUser).toBe('function');
    });

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

    });
});

describe('createPollResult', () => {
    test('should exist', () => {
        // Expects
        expect(redHelper.createPollResult).toBeDefined();
    });

    test('should be a function', () => {
        // Expects
        expect(typeof redHelper.createPollResult).toBe('function');
    });
});

describe('updateOpenVoteResult', () => {
    test('should exist', () => {
        // Expects
        expect(redHelper.updateOpenVoteResult).toBeDefined();
    });

    test('should be a function', () => {
        // Expects
        expect(typeof redHelper.updateOpenVoteResult).toBe('function');
    });

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
});

describe('updateSecretVoteResult', () => {
    test('should exist', () => {
        // Expects
        expect(redHelper.updateSecretVoteResult).toBeDefined();
    });

    test('should be a function', () => {
        // Expects
        expect(typeof redHelper.updateSecretVoteResult).toBe('function');
    });

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
});

describe('getUserIdsByPhone', () => {
    test('should exist', () => {
        // Expects
        expect(redHelper.getUserIdsByPhone).toBeDefined();
    });

    test('should be a function', () => {
        // Expects
        expect(typeof redHelper.getUserIdsByPhone).toBe('function');
    });

    test('should fail for non-array phoneNumbers', async () => {
        expect.assertions(1);
        try {
            // Data
            const phoneNumbers = '12156515';
            // Tests
            await redHelper.getUserIdsByPhone(phoneNumbers);
        } catch (err) {
            // Expects
            expect(err.message)
                .toEqual('argument \'phoneNumbers\' must be a nonEmptyString[]');
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
            expect(err.message)
                .toEqual('argument \'phoneNumbers\' must be a nonEmptyString[]');
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
            expect(err.message)
                .toEqual('argument \'phoneNumbers\' must be a nonEmptyString[]');
        }
    });
});

describe('getPollResults', () => {
    test('should exist', () => {
        // Expects
        expect(redHelper.getPollResults).toBeDefined();
    });

    test('should be a function', () => {
        // Expects
        expect(typeof redHelper.getPollResults).toBe('function');
    });
});

describe('getPollResult', () => {
    test('should exist', () => {
        // Expects
        expect(redHelper.getPollResult).toBeDefined();
    });

    test('should be a function', () => {
        // Expects
        expect(typeof redHelper.getPollResult).toBe('function');
    });

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
});

describe('getSubscribedUsers', () => {
    test('should exist', () => {
        // Expects
        expect(redHelper.getSubscribedUsers).toBeDefined();
    });

    test('should be a function', () => {
        // Expects
        expect(typeof redHelper.getSubscribedUsers).toBe('function');
    });

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
});

describe('getSubscribedUsersUntilTime', () => {
    test('should exist', () => {
        // Expects
        expect(redHelper.getSubscribedUsersUntilTime).toBeDefined();
    });

    test('should be a function', () => {
        // Expects
        expect(typeof redHelper.getSubscribedUsersUntilTime).toBe('function');
    });

    test('should fail for invalid pollid', async () => {
        expect.assertions(1);
        try {
            // Data
            const pollid = '2004';
            const timeUntilSubscriptionMade = 165498461;
            // Tests
            await redHelper.getSubscribedUsersUntilTime(pollid, timeUntilSubscriptionMade);
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
            await redHelper.getSubscribedUsersUntilTime(pollid, timeUntilSubscriptionMade);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'timeUntilSubscriptionMade\' must be a number');
        }
    });
});

describe('removeElapsedSubscriptions', () => {
    test('should exist', () => {
        // Expects
        expect(redHelper.removeElapsedSubscriptions).toBeDefined();
    });

    test('should be a function', () => {
        // Expects
        expect(typeof redHelper.removeElapsedSubscriptions).toBe('function');
    });

    test('should fail for invalid pollid', async () => {
        expect.assertions(1);
        try {
            // Data
            const pollid = '2004';
            const timeUntilSubscriptionMade = 165498461;
            // Tests
            await redHelper.removeElapsedSubscriptions(pollid, timeUntilSubscriptionMade);
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
            await redHelper.removeElapsedSubscriptions(pollid, timeUntilSubscriptionMade);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'timeUntilSubscriptionMade\' must be a number');
        }
    });
});
