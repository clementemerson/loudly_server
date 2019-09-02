const mongodb = require('./mongo').getDbConnection;
const dbtables = require('./dbtables');

const keyPrefix = require('../redis/key_prefix');
const redClient = require('../redis/redclient');

module.exports = {

  shareToGroup: async (data) => {
    console.log('db.grouppolls.shareToGroup');
    const date = new Date();
    const createdAt = date.getTime();
    const updatedAt = date.getTime();

    await mongodb().collection(dbtables.GroupPolls).insertOne({
      pollid: data.pollid,
      groupid: data.groupid,
      sharedby: data.user_id,
      createdAt: createdAt,
      updatedAt: updatedAt,
    });

    // Adding to Poll->[group list]
    await redClient.sadd(keyPrefix.pollInGroups + data.pollid, data.groupid);
    // Adding to Group->[poll list]
    await redClient.sadd(keyPrefix.pollsOfGroup + data.groupid, data.pollid);
  },

  groupHasPoll: async (data) => {
    console.log('db.grouppolls.isGroupHasPoll');
    const polls = await mongodb().collection(dbtables.GroupPolls)
        .find({
          pollid: data.pollid,
          groupid: data.groupid,
        }).toArray();
    return polls[0];
  },

  getPolls: async (groupid) => {
    console.log('db.grouppolls.getPolls');
    return await mongodb().collection(dbtables.GroupPolls)
        .find({groupid: groupid})
        .toArray();
  },

  getGroupsOfPoll: async (pollid) => {
    console.log('db.grouppolls.getGroupsOfPoll');
    return await mongodb().collection(dbtables.GroupPolls)
        .find({pollid: pollid})
        .toArray();
  },

};
