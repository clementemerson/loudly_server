const WebSocket = require('ws');
const url = require('url');
const mongo = require('./db/mongo');
const redClient = require('./redis/redclient');
let connections = require('./websockets/connections');

const keyPrefix = require('./redis/key_prefix');
const redHelper = require('./redis/redhelper');

let jwtController = require('./controllers/jwtController');
const updateController = require('./controllers/UpdateController');

let localServer = true;

var server;
if (localServer) {
  const http = require('http');
  server = http.createServer();
} else {
  const https = require('https');
  const fs = require('fs');
  server = https.createServer({
    cert: fs.readFileSync('/etc/letsencrypt/live/loudly.loudspeakerdev.net/fullchain.pem'),
    key: fs.readFileSync('/etc/letsencrypt/live/loudly.loudspeakerdev.net/privkey.pem')
  });
}

const wss = new WebSocket.Server({ server });

wss.on('connection', async (ws_client, req) => {
  var queryURL = url.parse(req.url, true);
  req.urlparams = queryURL.query;
  if (jwtController.validateJwt(req) == true) {
    let validData = await jwtController.validateJwtData(req);
    if (validData == true) {
      ws_client.jwtDetails = req.jwtDetails;
      console.log(ws_client.jwtDetails.user_id);
      connections.getConnections().set(ws_client.jwtDetails.user_id, ws_client);
    } else {
      console.log('Data not valid');
      ws_client.close();
      return;
    }
  } else {
    console.log('Token not valid');
    ws_client.close();
    return;
  }

  ws_client.is_alive = true;
  ws_client.on('pong', () => {
    ws_client.is_alive = true;
  });

  ws_client.on('close', () => {
    console.log('Closing connection - ', ws_client.jwtDetails.user_id)
    connections.getConnections().delete(ws_client.jwtDetails.user_id);
  });

  ws_client.send('{"Status":"Success","Details":{"module":"general","event":"connection established","messageid":0,"data":"something"}}');
});

//To check whether a client is still alive - 2 mins
setInterval(function ping() {
  Array.from(connections.getConnections().values()).forEach(function each(client_stream) {
    if (!client_stream.is_alive) { client_stream.terminate(); return; }
    client_stream.is_alive = true; //false?
    client_stream.ping();
  });
}, 15000);

//To send updates to the subscribed client - 500 ms
setInterval(async () => {
  console.log('Starting Update');
  await updateController.sendPollUpdates();
  await updateController.sendGroupUpdate();
  await updateController.sendGroupUserUpdate();
  await updateController.sendGroupPollUpdate();
}, 5000);

//To clear the elapsed subscriptions - 1 day
setInterval(function clearElapsedSubscriptions() {
  //get keys starting with pollsub_
  //check the subscription time, if it elapsed, remove it from the pollsub_pollid
  //send them detail about subscription clearing
}, 86400000);

//Init connection with DB
redClient.initRedisClient(initRedis);

function initRedis() {
  console.log('Redis connected');
  mongo.initDbConnection(initServer);
}

function initServer() {
  const PORT = process.env.PORT || 8090;
  server.listen(PORT, async () => {
    console.log("Websocket Server started at", PORT);
    // console.log = () => {};
  });
}