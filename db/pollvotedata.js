var mongodb = require('./mongo').getDbConnection;
var dbtables = require('./dbtables');

module.exports = {

    saveVote: async (data) => {
        console.log('db.pollvotedata.saveVote');
        let date = new Date();
        let createdAt = date.getTime();
        let updatedAt = date.getTime();

        await mongodb().collection(dbtables.PollVoteData).insertOne({
            pollid: data.pollid,
            user_id: data.user_id,
            optionindex: data.optionindex,
            createdAt: createdAt,
            updatedAt: updatedAt
        });
    },

    getGroupUsersVoteInfo: async (data) => {
        console.log('db.pollvotedata.getUsersVoteInfo');
        let groupUsers = await GroupUsers.getUsers(data.groupid);
        var user_ids = [];
        groupUsers.forEach(eachUser => {
            user_ids.push(eachUser.user_id);
        });

        return await mongodb().collection(dbtables.PollVoteData)
            .find({
                user_id: { $in: user_ids },
                pollid: data.pollid,
                updatedAt: { $gt: data.lastsynchedtime }
            }).toArray();
    },

}