//mongo
var mongodb = require('./mongo').getDbConnection;
var dbtables = require('./dbtables');

module.exports = {
    insert: async (data) => {
        console.log('db.users.insert');
        let date = new Date();
        let createdAt = date.getTime();
        let updatedAt = date.getTime();

        await mongodb().collection(dbtables.Users).insertOne({
            user_id: data.user_id,
            phonenumber: data.phonenumber,
            user_secret: data.user_secret_hashed,
            createdAt: createdAt,
            updatedAt: updatedAt
        });
    },
    //-------------------------------------------------------------------------
    insertInfo: async (data) => {
        console.log('db.users.insertInfo');
        let date = new Date();
        let createdAt = date.getTime();
        let updatedAt = date.getTime();

        let existingUsers = await mongodb().collection(dbtables.UsersInfo)
            .find({ user_id: data.user_id })
            .toArray();

        if (!existingUsers[0]) {
            await mongodb().collection(dbtables.UsersInfo)
                .insertOne({
                    user_id: data.user_id,
                    name: '~',
                    statusmsg: 'I vote on Looudly',
                    phonenumber: data.phonenumber,
                    createdAt: createdAt,
                    updatedAt: updatedAt
                });
        }

    },
    //-------------------------------------------------------------------------
    getOneByPhoneNumber: async (phonenumber) => {
        console.log('db.users.getOneByPhoneNumber');
        let users = await mongodb().collection(dbtables.Users)
            .find({ phonenumber: phonenumber })
            .toArray();
        return users[0];
    },
    //-------------------------------------------------------------------------
    deleteOldUserInfo: async (phonenumber) => {
        console.log('db.users.deleteOldUserInfo');
        await mongodb().collection(dbtables.Users)
            .deleteMany({ phonenumber: phonenumber });
    },
    //-------------------------------------------------------------------------
    getUsersByPhoneNumbers: async (phoneNumbers) => {
        console.log('db.users.getUsersByPhoneNumbers');
        return await mongodb().collection(dbtables.Users)
            .find({ phonenumber: { $in: phoneNumbers } },
                { user_id: 1, phonenumber: 1 })
            .toArray();

    },

    getUserInfoByUserIds: async (user_ids) => {
        console.log('db.users.getUserInfoByUserIds');
        return await mongodb().collection(dbtables.UsersInfo)
            .find({ user_id: { $in: user_ids } })
            .toArray();
    },

    isUserExist: async (user_id) => {
        console.log('db.users.isUserExist');
        let user = await mongodb().collection(dbtables.UsersInfo)
            .find({
                user_id: data.user_id
            })
            .toArray();

        if (user[0])
            return true;
        else
            return false;
    },

    changeName: async (data) => {
        console.log('db.users.changeName');
        let date = new Date();
        let updatedAt = date.getTime();

        await mongodb().collection(dbtables.UsersInfo).updateOne(
            { user_id: data.user_id },
            {
                $set: {
                    name: data.name,
                    updatedAt: updatedAt
                }
            });
    },

    changeStatusMsg: async (data) => {
        console.log('db.users.changeStatusMsg');
        let date = new Date();
        let updatedAt = date.getTime();

        await mongodb().collection(dbtables.UsersInfo).updateOne(
            { user_id: data.user_id },
            {
                $set: {
                    statusmsg: data.statusmsg,
                    updatedAt: updatedAt
                }
            });
    },
};
