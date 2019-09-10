const VError = require('verror');
const assert = require('assert');
const check = require('check-types');

const redClient = require('./redclient');
const keyPrefix = require('./key_prefix');

module.exports = {
    createUser: async (userid, phoneNumber) => {
        assert.ok(check.number(userid),
            'argument \'userid\' must be a number');
        assert.ok(check.string(phoneNumber),
            'argument \'phoneNumber\' must be a string');

        await redClient.hmset(keyPrefix.phoneNumber + phoneNumber, 'id', userid);
    },
    addGroupUser: async (groupid, userid) => {
        assert.ok(check.number(groupid),
            'argument \'groupid\' must be a number');
        assert.ok(check.number(userid),
            'argument \'userid\' must be a number');

        if (await redClient.exists(keyPrefix.usersOfGroup + groupid) == 1) {
            return await redClient.sadd(keyPrefix.usersOfGroup + groupid, userid);
        } else {
            return await redClient.sadd(keyPrefix.usersOfGroup + groupid, userid);
        }
    },
    createPollResult: async (pollid, options, createdAt, updatedAt) => {
        if (!pollid ||
            !options ||
            !createdAt ||
            !updatedAt) {
            throw new Error('Invalid Arguments');
        }

        await redClient.hmset(keyPrefix.pollResult + pollid, 'id', pollid,
            'at1', createdAt, 'at2', updatedAt);
        options.forEach(async (option, index) => {
            await redClient.hmset(keyPrefix.pollResult + pollid,
                'OV' + index.toString(), 0,
                'SV' + index.toString(), 0);
        });
    },
    updateOpenVoteResult: async (pollid, optionindex) => {
        assert.ok(check.number(pollid),
            'argument \'pollid\' must be a number');
        assert.ok(check.number(optionindex),
            'argument \'optionindex\' must be a number');

        await redClient.hincrby(keyPrefix.pollResult + pollid,
            'OV' + optionindex.toString(), 1);
    },
    updateSecretVoteResult: async (pollid, optionindex) => {
        assert.ok(check.number(pollid),
            'argument \'pollid\' must be a number');
        assert.ok(check.number(optionindex),
            'argument \'optionindex\' must be a number');

        await redClient.hincrby(keyPrefix.pollResult + pollid,
            'SV' + optionindex.toString(), 1);
    },
    getUserIdsByPhone: async (phoneNumbers) => {
        assert.ok(check.array.of.nonEmptyString(phoneNumbers),
            'argument \'phoneNumbers\' must be a nonEmptyString[]');

        return await redClient.multiget(keyPrefix.phoneNumber, phoneNumbers);
    },
    getPollResults: async (pollids) => {
        assert.ok(check.array.of.nonEmptyString(pollids),
            'argument \'pollids\' must be a number[]');

        return await redClient.multiget(keyPrefix.pollResult, pollids);
    },
    getPollResult: async (pollid) => {
        assert.ok(check.number(pollid),
            'argument \'pollid\' must be a number');

        return await redClient.hgetall(keyPrefix.pollResult + pollid);
    },
    getSubscribedUsers: async (pollid) => {
        assert.ok(check.number(pollid),
            'argument \'pollid\' must be a number');

        try {
            return await redClient
                .zrangebyscore(keyPrefix.pollSubsription + pollid, '-inf', '+inf');
        } catch (err) {
            console.log(err);
        }
    },
    getSubscribedUsersUntilTime: async (pollid, timeUntilSubscriptionMade) => {
        assert.ok(check.number(pollid),
            'argument \'pollid\' must be a number');
        assert.ok(check.number(timeUntilSubscriptionMade),
            'argument \'timeUntilSubscriptionMade\' must be a number');

        return await redClient.zrangebyscore(keyPrefix.pollSubsription + pollid,
            '-inf', timeUntilSubscriptionMade);
    },
    removeElapsedSubscriptions: async (pollid, timeUntilSubscriptionMade) => {
        assert.ok(check.number(pollid),
            'argument \'pollid\' must be a number');
        assert.ok(check.number(timeUntilSubscriptionMade),
            'argument \'timeUntilSubscriptionMade\' must be a number');

        return await redClient.zremrangebyscore(keyPrefix.pollSubsription + pollid,
            '-inf', timeUntilSubscriptionMade);
    },
};
