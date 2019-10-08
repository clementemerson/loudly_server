const WebSocket = require('ws');
const url = require('url');
const mongo = require('./db/mongo');
const redClient = require('./redis/redclient');
const connections = require('./websockets/connections');

const jwtController = require('./controllers/jwtController');
const updateController = require('./controllers/UpdateController');

// Config
const config = require('./config/dev');

const localServer = true;

let server;
module.exports = {
    initMainServer,
    stopListening
}

initMainServer(9080, config.mongoSettings, config.redisSettings, () => { });

function stopListening(done) {
    server.close((err) => {
        if (err === undefined) {
            console.log('Stop listening');
            done();
        }
    });
}

async function initMainServer(port, mongoSettings, redisSettings, done) {
    if (localServer) {
        const http = require('http');
        server = http.createServer();
    } else {
        const https = require('https');
        const fs = require('fs');
        server = https.createServer({
            cert: fs.readFileSync(
                '/etc/letsencrypt/live/loudly.loudspeakerdev.net/fullchain.pem'
            ),
            key: fs.readFileSync(
                '/etc/letsencrypt/live/loudly.loudspeakerdev.net/privkey.pem'
            ),
        });
    }

    const wss = new WebSocket.Server({ server });
    await initDB(port, mongoSettings, redisSettings);
    initWS(wss);
    watchConnections();
    done(wss);
}

function initWS(wss) {
    wss.on('connection', async (wsClient, req) => {
        const queryURL = url.parse(req.url, true);
        req.urlparams = queryURL.query;
        if (jwtController.validateJwt(req) == true) {
            const validData = await jwtController.validateJwtData(req);
            if (validData == true) {
                wsClient.jwtDetails = req.jwtDetails;
                console.log('Opening connection - ', wsClient.jwtDetails.user_id);
                connections.getConnections().set(wsClient.jwtDetails.user_id, wsClient);
            } else {
                console.log('Data not valid');
                wsClient.close();
                return;
            }
        } else {
            console.log('Token not valid');
            wsClient.close();
            return;
        }
        wsClient.onmessage = () => {};

        wsClient.is_alive = true;
        wsClient.on('pong', () => {
            wsClient.is_alive = true;
        });

        wsClient.on('close', () => {
            console.log('Closing connection - ', wsClient.jwtDetails.user_id);
            connections.getConnections().delete(wsClient.jwtDetails.user_id);
        });

        // Sending connection established message
        const data = {
            Status: 'Success',
            Details: {
                module: 'general',
                event: 'connection established',
                messageid: 0,
                data: 'something',
            },
        };
        wsClient.send(JSON.stringify(data));
    });
}

// To check whether a client is still alive - 2 mins
function watchConnections() {
    setInterval(function ping() {
        //   console.log(connections.getConnections().keys());

        Array.from(connections.getConnections().values()).forEach(function each(
            client
        ) {
            if (!client.is_alive) {
                client.terminate();
                return;
            }
            client.is_alive = true;
            client.ping();
        });
    }, 15000);
}

// To send updates to the subscribed client - 500 ms
setInterval(async () => {
  console.log('Starting Update');
  await updateController.sendPollUpdates();
  await updateController.sendGroupUpdate();
  await updateController.sendGroupUserUpdate();
  await updateController.sendGroupPollUpdate();
}, 5000);

// To clear the elapsed subscriptions - 1 day
setInterval(function clearElapsedSubscriptions() {
  // get keys starting with pollsub_
  // and check the subscription time.
  // if it elapsed, remove it from the pollsub_pollid.
  // send them detail about subscription is removed.
}, 86400000);

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
    server.listen(listenPort, function() {
      const host = server.address().address;
      const port = server.address().port;
      console.log('Example app listening at http://%s:%s', host, port);
    });
  }