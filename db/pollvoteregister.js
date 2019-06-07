var mongodb = require('./mongo').getDbConnection;
var dbtables = require('./dbtables');

module.exports = {
    
    getVotersList: async (data) => {
        console.log('db.polls.getVotersList');
        return await mongodb().collection(dbtables.PollVoteRegister)
            .find({ pollid: data.pollid },
                { user_id: 1 }).toArray();
    },

    updatePollVoterList: async (data) => {
        console.log('db.polls.updatePollVoterList');
        let date = new Date();
        let createdAt = date.toISOString();
        let updatedAt = date.toISOString();

        return await mongodb().collection(dbtables.PollVoteRegister).insertOne({
            pollid: data.pollid,
            user_id: data.user_id,
            votetype: data.votetype,
            createdAt: createdAt,
            updatedAt: updatedAt
        });
    },
}