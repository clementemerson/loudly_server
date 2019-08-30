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

    getUsersVotesByPoll: async (data) => {
        console.log('db.pollvotedata.getUsersVotesByPoll');
        return await mongodb().collection(dbtables.PollVoteData)
            .find({
                user_id: { $in: data.user_ids },
                pollid: data.pollid
            }).toArray();
    },

    getMyVotes: async (data) => {
        console.log('db.pollvotedata.getMyVotes');
        return await mongodb().collection(dbtables.PollVoteData)
            .find({
                user_id: data.user_id
            }).toArray();
    }

}