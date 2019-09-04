const WebSocket = require('ws');
const url = require('url');
const mongo = require('./db/mongo');
const redClient = require('./redis/redclient');
const connections = require('./websockets/connections');

const replyHelper = require('./helpers/replyhelper');

const jwtController = require('./controllers/jwtController');

const UsersModuleHandlers = require('./modulehandlers/usermodule');
const GroupsModuleHandlers = require('./modulehandlers/groupmodule');
const PollsModuleHandlers = require('./modulehandlers/pollmodule');

const localServer = true;

let server;
if (localServer) {
  const http = require('http');
  server = http.createServer();
} else {
  const https = require('https');
  const fs = require('fs');
  server = https.createServer({
    cert: fs.readFileSync(
        '/etc/letsencrypt/live/loudly.loudspeakerdev.net/fullchain.pem'),
    key: fs.readFileSync(
        '/etc/letsencrypt/live/loudly.loudspeakerdev.net/privkey.pem'),
  });
}

const wss = new WebSocket.Server({server});

// Init connection with DB
redClient.initRedisClient(initMongo);

wss.on('connection', async (wsClient, req) => {
  const queryURL = url.parse(req.url, true);
  req.urlparams = queryURL.query;
  if (jwtController.validateJwt(req) == true) {
    const validData = await jwtController.validateJwtData(req);
    if (validData == true) {
      wsClient.jwtDetails = req.jwtDetails;
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
  wsClient.onmessage = toEvent;

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

setInterval(function ping() {
  console.log(connections.getConnections().keys());

  Array.from(connections.getConnections().values())
      .forEach(function each(client) {
        if (!client.is_alive) {
          client.terminate(); return;
        }
        client.is_alive = true;
        client.ping();
      });
}, 5000);

/**
 * Websocket Message handling function
 *
 * @param {*} ws
 */
async function toEvent(ws) {
  let message = null;
  try {
    message = JSON.parse(ws.data);
    if (!message.module) {
      throw new Error('Invalid Arguments');
    }

    message.user_id = ws.target.jwtDetails.user_id;
    let reply;
    switch (message.module) {
      case 'users':
        reply = await UsersModuleHandlers.handle(message);
        break;
      case 'groups':
        reply = await GroupsModuleHandlers.handle(message);
        break;
      case 'polls':
        reply = await PollsModuleHandlers.handle(message);
        break;
      default:
        break;
    }

    const outMessage = await replyHelper.prepareSuccess(message, reply);
    connections.getConnections().get(ws.target.jwtDetails.user_id)
        .send(JSON.stringify(outMessage));
  } catch (err) {
    const outMessage = await replyHelper.prepareError(message, err.message);
    connections.getConnections().get(ws.target.jwtDetails.user_id)
        .send(JSON.stringify(outMessage));
  }
}

/**
 * Init DB Connection
 *
 */
function initMongo() {
  console.log('Redis connected');
  mongo.initDbConnection(initServer);
}

/**
 * Listen to external clients
 *
 */
function initServer() {
  const PORT = process.env.PORT || 8080;
  server.listen(PORT, async () => {
    console.log('Websocket Server started at', PORT);
    // console.log = () => {};
  });
}
