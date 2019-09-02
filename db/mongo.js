// mongo
const MongoClient = require('mongodb').MongoClient;
let mdb;
let dbClient;

module.exports = {
  getDbConnection: () => {
    return mdb;
  },
  initDbConnection: async (callback) => {
    const connectionUrl = 'mongodb://loudly.loudspeakerdev.net:27017/loudly';
    // Create the database connection
    dbClient = await MongoClient.connect(connectionUrl, {
      poolSize: 10,
      useNewUrlParser: true,
      // other options can go here
    });
    mdb = dbClient.db();
    callback();
  },
  getDbClient: () => {
    return dbClient;
  },
};
