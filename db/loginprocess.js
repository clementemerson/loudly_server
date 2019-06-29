//mongo
var mongodb = require('./mongo').getDbConnection;
var dbtables = require('./dbtables');

module.exports = {
    insert: function (data) {
        var date = new Date();
        var createdAt = date.getTime();
        var updatedAt = date.getTime();

        console.log('db.loginprocess.insert');
        mongodb().collection(dbtables.loginProcess).insertOne({
            session_id: data.session_id,
            phonenumber: data.phonenumber,
            createdAt: createdAt,
            updatedAt: updatedAt
        });
    },
    //-------------------------------------------------------------------------
    getOneBySessionId: async (session_id) => {
        return new Promise(
            function (resolve, reject) {
                try {
                    console.log('db.loginprocess.getOneBySessionId');
                    mongodb().collection(dbtables.loginProcess)
                        .find({ session_id: session_id })
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
        )
    },
    //-------------------------------------------------------------------------
    deleteBySessionId: async (session_id) => {
        console.log('db.loginprocess.deleteBySessionId');
        await mongodb().collection(dbtables.loginProcess)
            .deleteMany({ session_id: session_id });
    },
};
