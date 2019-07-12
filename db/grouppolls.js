var mongodb = require('./mongo').getDbConnection;
var dbtables = require('./dbtables');
const redClient = require('../redis/redclient').getRedClient;

module.exports = {
    
    shareToGroup: async (data) => {
        console.log('db.grouppolls.shareToGroup');
        let date = new Date();
        let createdAt = date.getTime();
        let updatedAt = date.getTime();

        await mongodb().collection(dbtables.GroupPolls).insertOne({
            pollid: data.pollid,
            groupid: data.groupid,
            sharedby: data.user_id,
            createdAt: createdAt,
            updatedAt: updatedAt
        });
    },

    groupHasPoll: async (data) => {
        console.log('db.grouppolls.isGroupHasPoll');
        let polls = await mongodb().collection(dbtables.GroupPolls)
            .find({
                pollid: data.pollid,
                groupid: data.groupid
            }).toArray();
        return polls[0];
    },

    getPolls: async (groupid) => {
        console.log('db.grouppolls.getPolls');
        return await mongodb().collection(dbtables.GroupPolls)
            .find({ groupid: groupid })
            .toArray();
    },

}