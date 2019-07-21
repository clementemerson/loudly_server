const redClient = require('./redclient');
const keyPrefix = require('./key_prefix');

module.exports = {
    updateGroupInfo: async (id, groupName, groupDesc, createdBy, createdAt) => {
        return await redClient.hmset(keyPrefix.groupInfo + id, 'id', id, 'N', groupName,
            'D', groupDesc, 'by', createdBy, 'at1', createdAt);
    },
    updateGroupName: async (id, groupName) => {
        return await redClient.hmset(keyPrefix.groupInfo + id, 'N', groupName);
    },
    updateGroupDesc: async (id, groupDesc) => {
        return await redClient.hmset(keyPrefix.groupInfo + id, 'D', groupDesc);
    },
    updatePollInfo: async (id, pollTitle, resultIsPublic, canBeShared, options, createdBy, createdAt) => {
        return await redClient.hmset(keyPrefix.pollInfo + id, 'id', id, 'T', pollTitle,
            'RP', resultIsPublic, 'S', canBeShared, 'O', JSON.stringify(options),
            'by', createdBy, 'at1', createdAt);
    },
    createPollResult: async (id, options, createdAt, updatedAt) => {
        await redClient.hmset(keyPrefix.pollResultUpdate + id, 'id', id,
            'at1', createdAt, 'at2', updatedAt);
        options.forEach(async (option, index) => {
            await redClient.hmset(keyPrefix.pollResultUpdate + id, 'OV' + index.toString(), 0, 'SV' + index.toString(), 0);
        });
    },
    updateOpenVoteResult: async (id, optionindex) => {
        await redClient.hincrby(keyPrefix.pollResultUpdate + id, 'OV' + optionindex.toString(), 1);
    },
    updateSecretVoteResult: async (id, optionindex) => {
        await redClient.hincrby(keyPrefix.pollResultUpdate + id, 'SV' + optionindex.toString(), 1);
    },
    getGroupInfo: async (groupids) => {
        return await redClient.multiget(keyPrefix.groupInfo, groupids);
    },
    getPollInfo: async (pollids) => {
        return await redClient.multiget(keyPrefix.pollInfo, pollids);
    },
    getPollResults: async (pollids) => {
        return await redClient.multiget(keyPrefix.pollResultUpdate, pollids);
    },
}