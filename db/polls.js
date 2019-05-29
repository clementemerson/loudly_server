var mongodb = require('./mongo').getDbConnection;
var dbtables = require('./dbtables');

module.exports = {
    create: async (data) => {
        console.log('db.polls.create');
        let date = new Date();
        let createdAt = date.toISOString();
        let updatedAt = date.toISOString();

        await mongodb().collection(dbtables.PollInfo).insertOne({
            id: data.id,
            title: data.title,
            issecret: data.issecret,
            canbeshared: data.canbeshared,
            createdby: data.createdby,
            options: data.options,
            createdAt: createdAt,
            updatedAt: updatedAt
        });
    },

    saveVote: async (data) => {
        console.log('db.polls.saveVote');
        let date = new Date();
        let createdAt = date.toISOString();
        let updatedAt = date.toISOString();

        await mongodb().collection(dbtables.VoteData).insertOne({
            pollid: data.pollid,
            user_id: data.user_id,
            optionindex: data.optionindex,
            createdAt: createdAt,
            updatedAt: updatedAt
        });
    },

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

    getPollInfo: async (data) => {
        console.log('db.polls.getPollInfo');
        let polls = await mongodb().collection(dbtables.PollInfo)
            .find({
                pollid: data.pollid
            }).toArray();
        return polls[0];
    },

    getVotersList: async (data) => {
        console.log('db.polls.getVotersList');
        return await mongodb().collection(dbtables.PollVoters)
            .find({ pollid: data.pollid },
                { user_id: 1 }).toArray();
    },

    updatePollVoterList: async (data) => {
        console.log('db.polls.updatePollVoterList');
        let date = new Date();
        let createdAt = date.toISOString();
        let updatedAt = date.toISOString();

        return await mongodb().collection(dbtables.PollVoters).insertOne({
            pollid: data.pollid,
            user_id: data.user_id,
            votetype: data.votetype,
            createdAt: createdAt,
            updatedAt: updatedAt
        });
    },

    updatePollResult: async (data) => {
        console.log('db.polls.updatePollResult');
        let date = new Date();
        let updatedAt = date.toISOString();

        return await mongodb().collection(dbtables.PollInfo).update(
            { pollid: data.pollid },
            { 
                //$inc: { 'options' + '' + '' : 1 },
                $set: { updatedAt: updatedAt }
            }
        );
    },
}