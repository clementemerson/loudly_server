const mongodb = require('./mongo').getDbConnection;
const dbtables = require('./dbtables');

const keyPrefix = require('../redis/key_prefix');
const redClient = require('../redis/redclient');

module.exports = {
    shareToGroup: async (data) => {
        console.log('db.grouppolls.shareToGroup');

        await mongodb()
            .collection(dbtables.GroupPolls)
            .insertOne({
                pollid: data.pollid,
                groupid: data.groupid,
                sharedby: data.user_id,
                createdAt: data.time,
                updatedAt: data.time,
            });

        // Adding to Poll->[group list]
        await redClient.sadd(keyPrefix.pollInGroups + data.pollid, data.groupid);
        // Adding to Group->[poll list]
        await redClient.sadd(keyPrefix.pollsOfGroup + data.groupid, data.pollid);
    },

    groupHasPoll: async (pollid, groupid) => {
        console.log('db.grouppolls.isGroupHasPoll');
        const polls = await mongodb()
            .collection(dbtables.GroupPolls)
            .find({
                pollid: pollid,
                groupid: groupid,
            })
            .toArray();
        if (polls[0]) {
            return true;
        } else {
            return false;
        }
    },

    getPolls: async (groupid) => {
        console.log('db.grouppolls.getPolls');
        return await mongodb()
            .collection(dbtables.GroupPolls)
            .find({ groupid: groupid })
            .toArray();
    },

    getGroupsOfPoll: async (pollid) => {
        console.log('db.grouppolls.getGroupsOfPoll');
        return await mongodb()
            .collection(dbtables.GroupPolls)
            .find({ pollid: pollid })
            .toArray();
    },
};
