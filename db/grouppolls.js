var mongodb = require('./mongo').getDbConnection;
var dbtables = require('./dbtables');

module.exports = {
    
    shareToGroup: async (data) => {
        console.log('db.polls.shareToGroup');
        let date = new Date();
        let createdAt = date.toISOString();
        let updatedAt = date.toISOString();

        await mongodb().collection(dbtables.GroupPolls).insertOne({
            pollid: data.pollid,
            groupid: data.groupid,
            sharedby: data.user_id,
            createdAt: createdAt,
            updatedAt: updatedAt
        });
    },

    isGroupHasPoll: async (data) => {
        console.log('db.polls.isGroupHasPoll');
        let polls = await mongodb().collection(dbtables.GroupPolls)
            .find({
                pollid: data.pollid,
                groupid: data.groupid
            }).toArray();
        return polls[0];
    },

    getPolls: async (data) => {
        console.log('db.groups.getPolls');
        return await mongodb().collection(dbtables.GroupPolls)
            .find({ groupid: data.groupid })
            .toArray();
    },

}