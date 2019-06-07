var mongodb = require('./mongo').getDbConnection;
var dbtables = require('./dbtables');

module.exports = {
    create: async (data) => {
        console.log('db.polls.create');
        let date = new Date();
        let createdAt = date.toISOString();
        let updatedAt = date.toISOString();

        await mongodb().collection(dbtables.PollData).insertOne({
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

    getPollInfo: async (data) => {
        console.log('db.polls.getPollInfo');
        let polls = await mongodb().collection(dbtables.PollData)
            .find({
                pollid: data.pollid
            }).toArray();
        return polls[0];
    },

    updatePollResult: async (data) => {
        console.log('db.polls.updatePollResult');
        let date = new Date();
        let updatedAt = date.toISOString();

        return await mongodb().collection(dbtables.PollData).update(
            { pollid: data.pollid },
            { 
                //$inc: { 'options' + '' + '' : 1 },
                $set: { updatedAt: updatedAt }
            }
        );
    },
}