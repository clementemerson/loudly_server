// mongo
const mongodb = require('./mongo').getDbConnection;
const dbtables = require('./dbtables');

module.exports = {
  insert: function(data) {
    const time = (new Date()).getTime();

    console.log('db.loginprocess.insert');
    mongodb()
        .collection(dbtables.loginProcess)
        .insertOne({
          session_id: data.session_id,
          phonenumber: data.phonenumber,
          createdAt: time,
          updatedAt: time,
        });
  },
  // -------------------------------------------------------------------------
  getOneBySessionId: async (sessionId) => {
    return new Promise(function(resolve, reject) {
      try {
        console.log('db.loginprocess.getOneBySessionId');
        mongodb()
            .collection(dbtables.loginProcess)
            .find({session_id: sessionId})
            .toArray(function(err, data) {
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
    });
  },
  // -------------------------------------------------------------------------
  deleteBySessionId: async (sessionId) => {
    console.log('db.loginprocess.deleteBySessionId');
    await mongodb()
        .collection(dbtables.loginProcess)
        .deleteMany({session_id: sessionId});
  },
};
