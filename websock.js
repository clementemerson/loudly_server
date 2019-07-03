const fs = require('fs');
const https = require('https');
const WebSocket = require('ws');
var url = require('url');
var mongo = require('./db/mongo');
let connections = require('./websockets/connections');

let jwtController = require('./controllers/jwtController');

let UsersModuleHandlers = require('./modulehandlers/usermodule');
let GroupsModuleHandlers = require('./modulehandlers/groupmodule');
let PollsModuleHandlers = require('./modulehandlers/pollmodule');

var success = require('./helpers/successtousers');


//const server = https.createServer();

const server = https.createServer({
  cert: fs.readFileSync('/etc/letsencrypt/live/loudly.loudspeakerdev.net/fullchain.pem'),
  key: fs.readFileSync('/etc/letsencrypt/live/loudly.loudspeakerdev.net/privkey.pem')
});

const wss = new WebSocket.Server({ server });

wss.on('connection', async (ws_client, req) => {
  var queryURL = url.parse(req.url, true);
  req.urlparams = queryURL.query;
  if (jwtController.validateJwt(req) == true) {
    let validData = await jwtController.validateJwtData(req);
    if (validData == true) {
      ws_client.jwtDetails = req.jwtDetails;
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
  ws_client.onmessage = toEvent;

  ws_client.is_alive = true;
  ws_client.on('pong', () => { 
    ws_client.is_alive = true; 
  });

  ws_client.on('close', () => {
    connections.getConnections().delete(ws_client.jwtDetails.user_id);
  });

  //ws.send('{module:"general", event:"connection established", status:"success", data:"something"');
  ws_client.send('{"Status":"Success","Details":{"module":"general","event":"connection established","messageid":0,"data":"something"}}');
});

setInterval(function ping() {
  console.log(connections.getConnections().keys());
  Array.from(connections.getConnections().values()).forEach(function each(client_stream) {
    if (!client_stream.is_alive) { client_stream.terminate(); return; }
    client_stream.is_alive = false;
    client_stream.ping();
  });
}, 5000);

async function toEvent(ws) {
  try {
    let message = JSON.parse(ws.data);
    console.log(message);
    message.user_id = ws.target.jwtDetails.user_id;
    var reply;
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

    console.log(reply);
    connections.getConnections()[ws.target.jwtDetails.user_id]
      .send(JSON.stringify(reply));
  } catch (err) {
    console.log(err);
  }
}

//Init connection with DB
mongo.initDbConnection(initServer);

function initServer() {
  server.listen(8080, () => {
    console.log("Websocket Server started at 8080");
  });
}