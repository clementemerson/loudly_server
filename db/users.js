// mongo
const mongodb = require('./mongo').getDbConnection;
const dbtables = require('./dbtables');

const redHelper = require('../redis/redhelper');

module.exports = {
  insert: async (data) => {
    console.log('db.users.insert');
    const time = (new Date()).getTime();

    await mongodb()
        .collection(dbtables.Users)
        .insertOne({
          user_id: data.user_id,
          phonenumber: data.phonenumber,
          user_secret: data.user_secret_hashed,
          createdAt: time,
          updatedAt: time,
        });

    await redHelper.createUser(data.user_id, data.phonenumber);
  },
  // -------------------------------------------------------------------------
  insertInfo: async (data) => {
    console.log('db.users.insertInfo');
    const time = (new Date()).getTime();

    const existingUsers = await mongodb()
        .collection(dbtables.UsersInfo)
        .find({user_id: data.user_id})
        .toArray();

    if (!existingUsers[0]) {
      await mongodb()
          .collection(dbtables.UsersInfo)
          .insertOne({
            user_id: data.user_id,
            name: '~',
            statusmsg: 'I vote on Loudly',
            phonenumber: data.phonenumber,
            createdAt: time,
            updatedAt: time,
          });
    }
  },
  // -------------------------------------------------------------------------
  getOneByPhoneNumber: async (phonenumber) => {
    console.log('db.users.getOneByPhoneNumber');
    const users = await mongodb()
        .collection(dbtables.Users)
        .find({phonenumber: phonenumber})
        .toArray();
    return users[0];
  },
  // -------------------------------------------------------------------------
  deleteOldUserInfo: async (phonenumber) => {
    console.log('db.users.deleteOldUserInfo');
    await mongodb()
        .collection(dbtables.Users)
        .deleteMany({phonenumber: phonenumber});
  },
  // -------------------------------------------------------------------------
  getUsersByPhoneNumbers: async (phoneNumbers) => {
    console.log('db.users.getUsersByPhoneNumbers');
    return await mongodb()
        .collection(dbtables.Users)
        .find(
            {phonenumber: {$in: phoneNumbers}},
            {user_id: 1, phonenumber: 1}
        )
        .toArray();
  },

  getUserInfoByUserIds: async (userIds) => {
    console.log('db.users.getUserInfoByUserIds');
    return await mongodb()
        .collection(dbtables.UsersInfo)
        .find({user_id: {$in: userIds}})
        .toArray();
  },

  isUserExist: async (userId) => {
    console.log('db.users.isUserExist');
    const user = await mongodb()
        .collection(dbtables.UsersInfo)
        .find({
          user_id: userId,
        })
        .toArray();

    if (user[0]) {
      return true;
    } else {
      return false;
    }
  },

  changeName: async (userId, name) => {
    console.log('db.users.changeName');
    const updatedAt = (new Date()).getTime();

    await mongodb()
        .collection(dbtables.UsersInfo)
        .updateOne(
            {user_id: userId},
            {
              $set: {
                name: name,
                updatedAt: updatedAt,
              },
            }
        );
  },

  changeStatusMsg: async (userId, statusmsg) => {
    console.log('db.users.changeStatusMsg');
    const updatedAt = (new Date()).getTime();

    await mongodb()
        .collection(dbtables.UsersInfo)
        .updateOne(
            {user_id: userId},
            {
              $set: {
                statusmsg: statusmsg,
                updatedAt: updatedAt,
              },
            }
        );
  },
};
