//mongo
var MongoClient = require('mongodb').MongoClient;
var mongodb;

module.exports = {
    getDbConnection: function(){
        return mongodb;
    },
    initDbConnection: function(callback) {
        // var connectionUrl;
        // // Create the database connection
        // MongoClient.connect(connectionUrl, {
        //     poolSize: 10
        //     // other options can go here
        // }, function (err, db) {
        //     assert.equal(null, err);
        //     mongodb = db;
        //     callback();
        // }
        // );

        mongodb = 'Clement';
        callback();
    },    
};
