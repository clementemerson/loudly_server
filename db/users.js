//mongo
var mongodb = require('./mongo').getDbConnection;
var dbtables = require('./dbtables');

module.exports = {
    insert: function (data) {
        return new Promise(
            function (resolve, reject) {
                try {
                    var date = new Date();
                    var createdAt = date.toISOString();
                    var updatedAt = date.toISOString();

                    mongodb().collection(dbtables.loginProcess).insertOne({
                        user_id: data.user_id,
                        phonenumber: data.phonenumber,
                        user_secret: data.user_secret_hashed,
                        createdAt: createdAt,
                        updatedAt: updatedAt
                    });
                    resolve();
                } catch (err) {
                    reject(err);
                }
            }
        );
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
                                    console.log('getByOTPSessionId - data', data);
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
    deleteOldUserInfo: function (phonenumber) {
        return new Promise(
            function (resolve, reject) {
                try {
                    mongodb().collection(dbtables.Users)
                        .deleteMany({ phonenumber: phonenumber });
                    resolve();
                } catch (err) {
                    reject(err);
                }
            }
        );
    }
};
