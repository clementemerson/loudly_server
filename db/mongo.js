//mongo
var MongoClient = require('mongodb').MongoClient;
var mdb;
var dbClient;
var assert = require('assert');

module.exports = {
    getDbConnection: () => {
        return mdb;
    },
    initDbConnection: async (callback) => {
        const connectionUrl = 'mongodb://loudly.loudspeakerdev.net:27017/loudly';
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
