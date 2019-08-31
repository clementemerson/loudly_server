const express = require('express');
const serverapp = express();
let server;
serverapp.use(express.json());

const mongo = require('./db/mongo');
const redClient = require('./redis/redclient');

// config
const listeningPort = 8081;

// Initialize ALL routes including subfolders
const fs = require('fs');
const path = require('path');

function recursiveRoutes(folderName) {
  fs.readdirSync(folderName).forEach(function(file) {
    const fullName = path.join(folderName, file);
    const stat = fs.lstatSync(fullName);

    if (stat.isDirectory()) {
      recursiveRoutes(fullName);
    } else if (file.toLowerCase().indexOf('.js')) {
      require('./' + fullName)(serverapp);
      console.log('require(\'' + fullName + '\')');
    }
  });
}

// Add all routes to app object
recursiveRoutes('routes'); // Initialize it

// Init connection with DB
redClient.initRedisClient(initRedis);

function initRedis() {
  console.log('Redis connected');
  mongo.initDbConnection(initServer);
}

function initServer() {
  server = serverapp.listen(listeningPort, function() {
    const host = server.address().address;
    const port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
  });
}
