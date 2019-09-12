const mongodb = require('./mongo').getDbConnection;
const dbtables = require('./dbtables');

const keyPrefix = require('../redis/key_prefix');
const redClient = require('../redis/redclient');

module.exports = {
  addUser: async (data) => {
    console.log('db.groupusers.addUser');
    const date = new Date();
    const createdAt = date.getTime();
    const updatedAt = date.getTime();

    await mongodb()
        .collection(dbtables.GroupUsers)
        .insertOne({
          groupid: data.groupid,
          user_id: data.user_id,
          addedby: data.addedby,
          permission: data.permission,
          createdAt: createdAt,
          updatedAt: updatedAt,
        });

    await redClient.sadd(keyPrefix.usersOfGroup + data.groupid, data.user_id);
    await redClient.sadd(keyPrefix.groupsOfUser + data.user_id, data.groupid);
  },

  changeUserPermission: async (data) => {
    console.log('db.groupusers.changeUserPermission');
    const date = new Date();
    const updatedAt = date.getTime();

    await mongodb()
        .collection(dbtables.GroupUsers)
        .update(
            {
              groupid: data.groupid,
              user_id: data.user_id,
            },
            {
              $set: {
                permission: data.permission,
                updatedAt: updatedAt,
              },
            }
        );
  },

  removeUser: async (data) => {
    console.log('db.groupusers.removeUser');
    await mongodb()
        .collection(dbtables.GroupUsers)
        .remove({
          groupid: data.groupid,
          user_id: data.user_id,
        });

    await redClient.srem(keyPrefix.usersOfGroup + data.groupid, data.user_id);
    await redClient.srem(keyPrefix.groupsOfUser + data.user_id, data.groupid);
  },

  getUsers: async (groupid) => {
    console.log('db.groupusers.getUsers');
    return await mongodb()
        .collection(dbtables.GroupUsers)
        .find({groupid: groupid})
        .toArray();
  },

  isAdmin: async (groupid, userid) => {
    console.log('db.groupusers.isAdmin');
    const adminUser = await mongodb()
        .collection(dbtables.GroupUsers)
        .find({
          groupid: groupid,
          user_id: userid,
          permission: 'ADMIN',
        })
        .toArray();

    if (adminUser[0]) {
      return true;
    } else {
      return false;
    }
  },

  isMember: async (groupid, userId) => {
    console.log('db.groupusers.isMember');
    const user = await mongodb()
        .collection(dbtables.GroupUsers)
        .find({
          groupid: groupid,
          user_id: userId,
        })
        .toArray();

    if (user[0]) {
      return true;
    } else {
      return false;
    }
  },

  getGroupsOfUser: async (userId) => {
    console.log('db.groupusers.getGroupsOfUser');

    return await mongodb()
        .collection(dbtables.GroupUsers)
        .find({
          user_id: userId,
        })
        .toArray();
  },
};
