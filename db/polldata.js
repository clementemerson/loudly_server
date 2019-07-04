var mongodb = require('./mongo').getDbConnection;
var dbtables = require('./dbtables');

module.exports = {
    create: async (data) => {
        console.log('db.polldata.create');
        let date = new Date();
        let createdAt = date.getTime();
        let updatedAt = date.getTime();

        await mongodb().collection(dbtables.PollData).insertOne({
            pollid: data.pollid,
            title: data.title,
            isdeleted: false,
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

    getPollInfoByPollIds: async (pollids) => {
        console.log('db.polldata.getPollInfoByPollIds');
        return await mongodb().collection(dbtables.PollData)
            .find({ pollid: { $in: pollids } })
            .toArray();
    },

    isCreator: async (data) => {
        console.log('db.polldata.isCreator');
        let isCreator = await mongodb().collection(dbtables.PollData)
            .find({
                createdby: data.user_id,
                pollid: data.pollid
            })
            .toArray();

        if (isCreator[0])
            return true;
        else
            return false;
    },

    delete: async (data) => {
        console.log('db.polldata.delete');
        let date = new Date();
        let updatedAt = date.getTime();

        await mongodb().collection(dbtables.PollData).updateOne(
            { pollid: data.pollid },
            {
                $set: {
                    isdeleted: true,
                    updatedAt: updatedAt
                }
            });
    },

    isDeleted: async (data) => {
        console.log('db.polldata.isDeleted');
        let isDeleted = await mongodb().collection(dbtables.PollData)
            .find({
                pollid: data.pollid,
                isdeleted: true
            })
            .toArray();

        if (isDeleted[0])
            return true;
        else
            return false;
    },
}