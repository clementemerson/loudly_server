var mongodb = require('./mongo').getDbConnection;
var dbtables = require('./dbtables');
let PollVoteRegister = require('./pollvoteregister');

const redHelper = require('../redis/redhelper');

module.exports = {

    create: async (data) => {
        console.log('db.pollresult.create');
        data.options.forEach(Itr => {
            Itr.openvotes = 0;
            Itr.secretvotes = 0;
        });

        let createdAt = data.time.getTime();
        let updatedAt = data.time.getTime();

        await mongodb().collection(dbtables.PollResult).insertOne({
            pollid: data.pollid,
            options: data.options,
            createdAt: createdAt,
            updatedAt: updatedAt
        });

        //await 
    },

    updatePollResult: async (data) => {
        console.log('db.pollresult.updatePollResult');
        console.log(data);
        let date = new Date();
        let updatedAt = date.getTime();

        if (data.secretvote == true) {
            await mongodb().collection(dbtables.PollResult)
                .updateOne(
                    {
                        pollid: data.pollid,
                        "options.index": data.optionindex
                    },
                    {
                        $inc: { "options.$.secretvotes": 1 },
                        $set: { updatedAt: updatedAt }
                    });
            await redHelper.updateSecretVoteResult(data.pollid, data.optionindex);
        } else {
            await mongodb().collection(dbtables.PollResult)
                .updateOne(
                    {
                        pollid: data.pollid,
                        'options.index': data.optionindex
                    },
                    {
                        $inc: { "options.$.openvotes": 1 },
                        $set: { updatedAt: updatedAt }
                    });
            await redHelper.updateOpenVoteResult(data.pollid, data.optionindex);
        }
    },

    getUpdatedPollResults: async (data) => {
        console.log('db.pollresult.syncPollResults');
        return await mongodb().collection(dbtables.PollResult).find({
            pollid: { $in: data.pollids },
            updatedAt: { $gt: data.lastsynchedtime }
        }).toArray();
    },

    getPollResult: async (pollid) => {
        console.log('db.pollresult.getPollResult');
        return await mongodb().collection(dbtables.PollResult).find({
            pollid: pollid
        }).toArray();
    },
}