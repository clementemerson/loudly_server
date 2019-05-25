//mongo
var mongodb = require('./mongo').getDbConnection;
var dbtables = require('./dbtables');

module.exports = {
    insert: async (data) => {
        let date = new Date();
        let createdAt = date.toISOString();
        let updatedAt = date.toISOString();

        mongodb().collection(dbtables.Users).insertOne({
            user_id: data.user_id,
            phonenumber: data.phonenumber,
            user_secret: data.user_secret_hashed,
            createdAt: createdAt,
            updatedAt: updatedAt
        });
    },
    //-------------------------------------------------------------------------
    insertInfo: async (data) => {
        let date = new Date();
        let createdAt = date.toISOString();
        let updatedAt = date.toISOString();

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
    getOneByPhoneNumber: function (phonenumber) {
        return new Promise(
            function (resolve, reject) {
                try {
                    mongodb().collection(dbtables.Users)
                        .find({ phonenumber: phonenumber })
                        .toArray(function (err, data) {
                            if (err) {
                                reject(err);
                            } else {
                                if (data[0]) {
                                    resolve(data[0]);
                                } else {
                                    resolve(null);
                                }
                            }
                        });
                } catch (err) {
                    reject(err);
                }
            }
        );
    },
    //-------------------------------------------------------------------------
    deleteOldUserInfo: async (phonenumber) => {
        await mongodb().collection(dbtables.Users)
            .deleteMany({ phonenumber: phonenumber });
    },
    //-------------------------------------------------------------------------
    getUsersByPhoneNumbers: function (phoneNumbers) {
        return new Promise(
            function (resolve, reject) {
                try {
                    mongodb().collection(dbtables.Users)
                        .find({ phonenumber: { $in: phoneNumbers } },
                            { user_id: 1, phonenumber: 1 })
                        .toArray(function (err, data) {
                            if (err) {
                                reject(err);
                            } else {
                                if (data) {
                                    resolve(data);
                                } else {
                                    resolve(null);
                                }
                            }
                        });
                } catch (err) {
                    reject(err);
                }
            }
        );
    },

    getUserInfoByUserIds: async (user_ids) => {
        return await mongodb().collection(dbtables.UsersInfo)
            .find({ user_id: { $in: user_ids } })
            .toArray();
    },
};
