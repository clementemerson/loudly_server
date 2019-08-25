//mongo
var MongoClient = require('mongodb').MongoClient;
var mdb;
var dbClient;

module.exports = {
    getDbConnection: () => {
        return mdb;
    },
    initDbConnection: async (callback) => {
        const connectionUrl = 'mongodb://localhost:27017/loudly';
        // Create the database connection
        dbClient = await MongoClient.connect(connectionUrl, {
            poolSize: 10,
            useNewUrlParser: true
            // other options can go here
        });
        mdb = dbClient.db();
        callback();
    },
    getDbClient: () => {
        return dbClient;
    }
};
