const mongodb = require('./mongo').getDbConnection;
const dbtables = require('./dbtables');

module.exports = {
  create: async (data) => {
    console.log('db.polldata.create');
    const createdAt = data.time.getTime();
    const updatedAt = data.time.getTime();

    await mongodb().collection(dbtables.PollData).insertOne({
      pollid: data.pollid,
      title: data.title,
      isdeleted: false,
      resultispublic: data.resultispublic,
      canbeshared: data.canbeshared,
      createdby: data.createdby,
      options: data.options,
      createdAt: createdAt,
      updatedAt: updatedAt,
    });
  },

  getPollInfo: async (pollid) => {
    console.log('db.polldata.getPollInfo');
    const polls = await mongodb().collection(dbtables.PollData)
        .find({
          pollid: pollid,
        }).toArray();
    return polls[0];
  },

  getPollInfoByPollIds: async (pollids) => {
    console.log('db.polldata.getPollInfoByPollIds');
    return await mongodb().collection(dbtables.PollData)
        .find({pollid: {$in: pollids}})
        .toArray();
  },

  isCreator: async (userid, pollid) => {
    console.log('db.polldata.isCreator');
    const isCreator = await mongodb().collection(dbtables.PollData)
        .find({
          createdby: userid,
          pollid: pollid,
        })
        .toArray();

    if (isCreator[0]) {
      return true;
    } else {
      return false;
    }
  },

  delete: async (pollid) => {
    console.log('db.polldata.delete');
    const date = new Date();
    const updatedAt = date.getTime();

    await mongodb().collection(dbtables.PollData).updateOne(
        {pollid: pollid},
        {
          $set: {
            isdeleted: true,
            updatedAt: updatedAt,
          },
        });
  },

  isDeleted: async (pollid) => {
    console.log('db.polldata.isDeleted');
    const isDeleted = await mongodb().collection(dbtables.PollData)
        .find({
          pollid: pollid,
          isdeleted: true,
        })
        .toArray();

    if (isDeleted[0]) {
      return true;
    } else {
      return false;
    }
  },
};
