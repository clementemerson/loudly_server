const mongodb = require('./mongo').getDbConnection;
const dbtables = require('./dbtables');

module.exports = {
  shareWithUser: async (data) => {
    console.log('db.userpolls.shareWithUser');
    const time = (new Date()).getTime();

    await mongodb()
        .collection(dbtables.UserPolls)
        .update(
            {
              pollid: data.pollid,
              userid: data.user_id,
            },
            {
              pollid: data.pollid,
              userid: data.user_id,
              sharedby: data.sharedby,
              createdAt: time,
              updatedAt: time,
            },
            {upsert: true}
        );
  },

  userHasPoll: async (userid, pollid) => {
    console.log('db.userpolls.userHasPoll');
    const polls = await mongodb()
        .collection(dbtables.UserPolls)
        .find({
          pollid: pollid,
          userid: userid,
        })
        .toArray();
    return polls[0];
  },

  getPolls: async (userid) => {
    console.log('db.userpolls.getPolls');
    return await mongodb()
        .collection(dbtables.UserPolls)
        .find({userid: userid})
        .toArray();
  },
};
