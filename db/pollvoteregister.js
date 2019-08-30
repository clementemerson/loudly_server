var mongodb = require('./mongo').getDbConnection;
var dbtables = require('./dbtables');

module.exports = {

    getVotersList: async (pollid) => {
        console.log('db.pollvoteregister.getVotersList');
        return await mongodb().collection(dbtables.PollVoteRegister)
            .find({ 
                pollid: pollid 
            }).toArray();
    },

    updatePollVoterList: async (data) => {
        console.log('db.pollvoteregister.updatePollVoterList');
        let date = new Date();
        let createdAt = date.getTime();
        let updatedAt = date.getTime();

        return await mongodb().collection(dbtables.PollVoteRegister)
        .insertOne({
            pollid: data.pollid,
            user_id: data.user_id,
            votetype: data.secretvote == true ? 'secretvote' : 'openvote',
            createdAt: createdAt,
            updatedAt: updatedAt
        });
    },

    getUserPolls: async (data) => {
        console.log('db.pollvoteregister.getUserPolls');
        return await mongodb().collection(dbtables.PollVoteRegister)
            .find({ 
                user_id: data.user_id 
            }).toArray();
    },

    isUserVoted: async (data) => {
        console.log('db.pollvoteregister.isUserVoted');
        let votes = await mongodb().collection(dbtables.PollVoteRegister)
            .find({ 
                pollid: data.pollid,
                user_id: data.user_id 
            }).toArray();

            console.log(votes);
        if (votes[0])
            return true;
        else
            return false;
    }
}