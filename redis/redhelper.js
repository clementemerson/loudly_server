const redClient = require('./redclient');
const keyPrefix = require('./key_prefix');

module.exports = {
    createUser: async (userid, phoneNumber) => {
        if(!userid || !phoneNumber)
            throw "Invalid Arguments";

        await redClient.hmset(keyPrefix.phoneNumber + phoneNumber, 'id', userid);
    },
    addGroupUser: async (groupid, userid) => {
        if(!groupid || !userid)
            throw "Invalid Arguments";

        if (await redClient.exists(keyPrefix.groupUsers + groupid) == 1)
            return await redClient.sadd(keyPrefix.groupUsers + groupid, userid);
        else
            return await redClient.sadd(keyPrefix.groupUsers + groupid, userid);
    },
    createPollResult: async (pollid, options, createdAt, updatedAt) => {
        if(!pollid || !options || !createdAt || !updatedAt)
            throw "Invalid Arguments";

        await redClient.hmset(keyPrefix.pollResult + pollid, 'id', pollid,
            'at1', createdAt, 'at2', updatedAt);
        options.forEach(async (option, index) => {
            await redClient.hmset(keyPrefix.pollResult + pollid, 'OV' + index.toString(), 0, 'SV' + index.toString(), 0);
        });
    },
    updateOpenVoteResult: async (pollid, optionindex) => {
        if(!pollid || !optionindex)
            throw "Invalid Arguments";

        await redClient.hincrby(keyPrefix.pollResult + pollid, 'OV' + optionindex.toString(), 1);
    },
    updateSecretVoteResult: async (pollid, optionindex) => {
        if(!pollid || !optionindex)
            throw "Invalid Arguments";

        await redClient.hincrby(keyPrefix.pollResult + pollid, 'SV' + optionindex.toString(), 1);
    },
    getUserIdsByPhone: async (phoneNumbers) => {
        if(!phoneNumbers)
            throw "Invalid Arguments";

        return await redClient.multiget(keyPrefix.phoneNumber, phoneNumbers);
    },
    getPollResults: async (pollids) => {
        if(!pollids)
            throw "Invalid Arguments";

        return await redClient.multiget(keyPrefix.pollResult, pollids);
    },
    getPollResult: async (pollid) => {
        if(!pollid)
            throw "Invalid Arguments";

        return await redClient.hgetall(keyPrefix.pollResult + pollid);
    }
}