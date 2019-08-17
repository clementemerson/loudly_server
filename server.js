var express = require('express');
var serverapp = express();
var server;
serverapp.use(express.json())

var mongo = require('./db/mongo');
const redClient = require('./redis/redclient');

//config
var listen_to_port = 8081;

//Initialize ALL routes including subfolders
var fs = require('fs');
var path = require('path');

function recursiveRoutes(folderName) {
    fs.readdirSync(folderName).forEach(function (file) {

        var fullName = path.join(folderName, file);
        var stat = fs.lstatSync(fullName);

        if (stat.isDirectory()) {
            recursiveRoutes(fullName);
        } else if (file.toLowerCase().indexOf('.js')) {
            require('./' + fullName)(serverapp);
            console.log("require('" + fullName + "')");
        }
    });
}

//Add all routes to app object
recursiveRoutes('routes'); // Initialize it

//Init connection with DB
redClient.initRedisClient(initRedis);

function initRedis() {
  console.log('Redis connected');
  mongo.initDbConnection(initServer);
}

function initServer() {
    server = serverapp.listen(listen_to_port, function () {
        var host = server.address().address
        var port = server.address().port
        console.log("Example app listening at http://%s:%s", host, port)
    })
}
