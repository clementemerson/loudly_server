const fs = require('fs');
const path = require('path');

const express = require('express');
const serverapp = express();
serverapp.use(express.json());

const mongo = require('./db/mongo');
const redClient = require('./redis/redclient');

// config
const listenPort = 8081;

// Initialize ALL routes including subfolders
recursiveRoutes('routes');

let server;
// Init connection with DB and establish connection one by one
initDB();

// --------------------------------------------------------------------------------

/**
 *  Add all routes to the app
 *
 * @param {string} folderName
 */
function recursiveRoutes(folderName) {
    fs.readdirSync(folderName).forEach(function (file) {
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

/**
 * Init DB
 *
 */
async function initDB() {
    // Init connection with DB
    await redClient.initRedisClient();
    console.log('Redis connected');
    await mongo.initDbConnection();
    console.log('Mongo connected');
    initServer();
}

/**
 * Listen to external clients
 *
 */
function initServer() {
    server = serverapp.listen(listenPort, function () {
        const host = server.address().address;
        const port = server.address().port;
        console.log('Example app listening at http://%s:%s', host, port);
    });
}
