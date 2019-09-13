const express = require('express');
const serverapp = express();
serverapp.use(express.json());

const mongo = require('./db/mongo');
const redClient = require('./redis/redclient');

// config
const listenPort = 8081;

// Initialize ALL routes including subfolders
configRoutes();

let server;
// Init connection with DB and establish connection one by one
initDB();

// --------------------------------------------------------------------------------

/**
 *  Add all routes to the app
 *
 */
function configRoutes() {
  require('./routes/loginusers')(serverapp);
}

/**
 * Init DB
 *
 */
async function initDB() {
  // Init connection with DB
  await redClient.initRedisClient('loudly.loudspeakerdev.net', 6379, 0);
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
  server = serverapp.listen(listenPort, function() {
    const host = server.address().address;
    const port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
  });
}
