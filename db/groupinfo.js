const mongodb = require('./mongo').getDbConnection;
const dbtables = require('./dbtables');

module.exports = {
  create: async (data) => {
    console.log('db.groupinfo.create');

    await mongodb()
        .collection(dbtables.GroupInfo)
        .insertOne({
          groupid: data.id,
          name: data.name,
          desc: data.desc,
          createdby: data.createdby,
          createdAt: data.time,
          updatedAt: data.time,
        });
  },

  changeTitle: async (data) => {
    console.log('db.groupinfo.changeTitle');
    const time = (new Date()).getTime();

    await mongodb()
        .collection(dbtables.GroupInfo)
        .updateOne(
            {groupid: data.groupid},
            {
              $set: {
                name: data.name,
                updatedAt: time,
              },
            }
        );
  },

  changeDesc: async (data) => {
    console.log('db.groupinfo.changeDesc');
    const time = (new Date()).getTime();

    await mongodb()
        .collection(dbtables.GroupInfo)
        .updateOne(
            {groupid: data.groupid},
            {
              $set: {
                desc: data.desc,
                updatedAt: time,
              },
            }
        );
  },

  delete: async (data) => {
    console.log('db.groupinfo.delete');
    await mongodb()
        .collection(dbtables.GroupInfo)
        .remove({
          groupid: data.id,
        });
  },

  getGroupsInfo: async (groupids) => {
    console.log('db.groupinfo.getGroupsInfo');
    return await mongodb()
        .collection(dbtables.GroupInfo)
        .find({groupid: {$in: groupids}})
        .toArray();
  },
};
