const check = require('check-types');

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
        '/etc/letsencrypt/live/loudly.loudspeakerdev.net/fullchain.pem'
    ),
    key: fs.readFileSync(
        '/etc/letsencrypt/live/loudly.loudspeakerdev.net/privkey.pem'
    ),
  });
}

const wss = new WebSocket.Server({server});
initDB();

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

/**
 * Websocket Message handling function
 *
 * @param {*} ws
 */
async function toEvent(ws) {
  let message = null;
  console.log(ws.data);
  try {
    if (checkMessageFormat(ws.data) == false) {
      const outMessage = {
        Status: 'Error',
        Details: {
          module: 'general',
          event: 'not applicable',
          messageid: 0,
          data: 'Invalid message format',
        },
      };
      connections
          .getConnections()
          .get(ws.target.jwtDetails.user_id)
          .send(JSON.stringify(outMessage));
      return;
    }

    message = JSON.parse(ws.data);
    console.log(message);
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
    console.log(outMessage);
    connections
        .getConnections()
        .get(ws.target.jwtDetails.user_id)
        .send(JSON.stringify(outMessage));
  } catch (err) {
      console.log(err);
    const outMessage = await replyHelper.prepareError(message, err.message);
    console.log(outMessage);
    connections
        .getConnections()
        .get(ws.target.jwtDetails.user_id)
        .send(JSON.stringify(outMessage));
  }

  /**
   * To check the validity of the received message
   *
   * @param {*} data
   * @return {boolean} Whether the format is correct or not
   */
  function checkMessageFormat(data) {
    try {
      const message = JSON.parse(data);
      const bValid = check.all(
          check.map(message, {
            module: check.string,
            event: check.string,
            messageid: check.number,
          })
      );

      return bValid;
    } catch (err) {
      return false;
    }
  }
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
  const PORT = process.env.PORT || 8080;
  server.listen(PORT, async () => {
    console.log('Websocket Server started at', PORT);
    // console.log = () => {};
  });
}
