//mongo
var mongodb = require('./mongo').getDbConnection;
var dbtables = require('./dbtables');

module.exports = {
    insert: function (data) {
        var date = new Date();
        var createdAt = date.toISOString();
        var updatedAt = date.toISOString();

        mongodb().collection(dbtables.loginProcess).insertOne({
            session_id: data.session_id,
            phonenumber: data.phonenumber,
            createdAt: createdAt,
            updatedAt: updatedAt
        });
    },
    //-------------------------------------------------------------------------
    getOneByOTPSessionId: function (session_id) {
        return new Promise(
            function (resolve, reject) {
                try {
                    mongodb().collection(dbtables.loginProcess)
                        .find({ session_id: session_id })
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
        )
    }
};
