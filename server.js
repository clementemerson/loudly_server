const express = require('express');
const serverapp = express();
serverapp.use(express.json());

const mongo = require('./db/mongo');
const redClient = require('./redis/redclient');

const config = require('./config/dev');

// Initialize ALL routes including subfolders
configRoutes();

let server;
// Init connection with DB and establish connection one by one
initDB(8081, config.mongoSettings, config.redisSettings);

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
/**
 * Init DB
 *
 */
async function initDB(port, mongoSettings, redisSettings) {
    // Init connection with DB
    await redClient.initRedisClient(
        redisSettings.url,
        redisSettings.port,
        redisSettings.db,
        redisSettings.pwd);
    console.log('Redis connected');
    await mongo.initDbConnection(
        mongoSettings.url,
        mongoSettings.user,
        mongoSettings.pwd,
        mongoSettings.db
    );
    console.log('Mongo connected');
    initServer(port);
}

/**
 * Listen to external clients
 *
 */
function initServer(listenPort) {
  server = serverapp.listen(listenPort, function() {
    const host = server.address().address;
    const port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
  });
}
