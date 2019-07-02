var mongodb = require('./mongo').getDbConnection;
var dbtables = require('./dbtables');
let PollVoteRegister = require('./pollvoteregister');

module.exports = {

    create: async (data) => {
        console.log('db.pollresult.create');
        data.options.forEach(Itr => {
            Itr.openvotes = 0;
            Itr.secretvotes = 0;
        });

        let date = new Date();
        let createdAt = date.getTime();
        let updatedAt = date.getTime();

        await mongodb().collection(dbtables.PollResult).insertOne({
            pollid: data.pollid,
            options: data.options,
            createdAt: createdAt,
            updatedAt: updatedAt
        });
    },

    updatePollResult: async (data) => {
        console.log('db.pollresult.updatePollResult');
        console.log(data);
        let date = new Date();
        let updatedAt = date.getTime();

        if (data.secretvote == true) {
            return await mongodb().collection(dbtables.PollResult)
                .updateOne(
                    {
                        pollid: data.pollid,
                        "options.index": data.optionindex
                    },
                    {
                        $inc: { "options.$.secretvotes": 1 }
                    });
        } else {
            return await mongodb().collection(dbtables.PollResult)
                .updateOne(
                    {
                        pollid: data.pollid,
                        'options.index': data.optionindex
                    },
                    {
                        $inc: { "options.$.openvotes": 1 }
                    });
        }
    },

    syncPollResults: async (data) => {
        console.log('db.pollresult.syncPollResults');
        let userPolls = await PollVoteRegister.getUserPolls(data);
        var pollids = [];
        userPolls.forEach(Itr => {
            pollids.push(Itr.pollid);
        });
        console.log(pollids);

        return await mongodb().collection(dbtables.PollResult).find({
            pollid: { $in: pollids },
            updatedAt: { $gt: data.lastsynchedtime }
        }).toArray();
    },
}