//mongo
var MongoClient = require('mongodb').MongoClient;
var mdb;
var assert = require('assert');

module.exports = {
    getDbConnection: () => {
        return mdb;
    },
    initDbConnection: (callback) => {
        const connectionUrl = 'mongodb://loudly.loudspeakerdev.net:27017';
        // Create the database connection
        MongoClient.connect(connectionUrl, {
            poolSize: 10,
            useNewUrlParser: true
            // other options can go here
        }, function (err, client) {
            assert.equal(null, err);
            mdb = client.db('loudly');
            callback();
        });
    },
};
