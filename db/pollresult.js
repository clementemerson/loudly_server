const mongodb = require('./mongo').getDbConnection;
const dbtables = require('./dbtables');

const redHelper = require('../redis/redhelper');

module.exports = {
  create: async (data) => {
    console.log('db.pollresult.create');
    data.options.forEach((Itr) => {
      Itr.openvotes = 0;
      Itr.secretvotes = 0;
    });

    await mongodb()
        .collection(dbtables.PollResult)
        .insertOne({
          pollid: data.pollid,
          options: data.options,
          createdAt: data.time,
          updatedAt: data.time,
        });

    // await
  },

  updatePollResult: async (data) => {
    console.log('db.pollresult.updatePollResult');
    const date = new Date();
    const updatedAt = date.getTime();

    if (data.secretvote == true) {
      await mongodb()
          .collection(dbtables.PollResult)
          .updateOne(
              {
                'pollid': data.pollid,
                'options.index': data.optionindex,
              },
              {
                $inc: {'options.$.secretvotes': 1},
                $set: {updatedAt: updatedAt},
              }
          );
      await redHelper.updateSecretVoteResult(data.pollid, data.optionindex);
    } else {
      await mongodb()
          .collection(dbtables.PollResult)
          .updateOne(
              {
                'pollid': data.pollid,
                'options.index': data.optionindex,
              },
              {
                $inc: {'options.$.openvotes': 1},
                $set: {updatedAt: updatedAt},
              }
          );
      await redHelper.updateOpenVoteResult(data.pollid, data.optionindex);
    }
  },

  getPollResult: async (pollid) => {
    console.log('db.pollresult.getPollResult');
    return await mongodb()
        .collection(dbtables.PollResult)
        .find({
          pollid: pollid,
        })
        .toArray();
  },
};
