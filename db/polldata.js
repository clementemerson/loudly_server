var mongodb = require('./mongo').getDbConnection;
var dbtables = require('./dbtables');

module.exports = {
    create: async (data) => {
        console.log('db.polldata.create');
        let date = new Date();
        let createdAt = date.toISOString();
        let updatedAt = date.toISOString();

        await mongodb().collection(dbtables.PollData).insertOne({
            pollid: data.id,
            title: data.title,
            resultispublic: data.resultispublic,
            canbeshared: data.canbeshared,
            createdby: data.createdby,
            options: data.options,
            createdAt: createdAt,
            updatedAt: updatedAt
        });
    },

    getPollInfo: async (data) => {
        console.log('db.polldata.getPollInfo');
        let polls = await mongodb().collection(dbtables.PollData)
            .find({
                pollid: data.pollid
            }).toArray();
        return polls[0];
    },

    updatePollResult: async (data) => {
        console.log('db.polldata.updatePollResult');
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

    getPollInfoByPollIds: async (pollids) => {
        console.log('db.polldata.getPollInfoByPollIds');
        return await mongodb().collection(dbtables.PollData)
            .find({ pollid: { $in: pollids } })
            .toArray();
    }
}