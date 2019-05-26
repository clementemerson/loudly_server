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
            createdby: data.createdby,
            options: data.options,
            createdAt: createdAt,
            updatedAt: updatedAt
        });
    },

    vote: async (data) => {
        console.log('db.polls.vote');
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
}