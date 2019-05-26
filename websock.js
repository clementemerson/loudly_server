const fs = require('fs');
const https = require('https');
const WebSocket = require('ws');
var url = require('url');
var mongo = require('./db/mongo');
let connections = require('./websockets/connections');

let jwtController = require('./controllers/jwtController');
let UserController = require('./controllers/UserController');

let UsersModuleHandlers = require('./modulehandlers/usermodule');
let GroupsModuleHandlers = require('./modulehandlers/groupmodule');
let PollsModuleHandlers = require('./modulehandlers/pollmodule');


const server = https.createServer({
  cert: fs.readFileSync('/Users/Coder/local-ssl/localhost.crt'),
  key: fs.readFileSync('/Users/Coder/local-ssl/localhost.key')
});
const wss = new WebSocket.Server({ server });

wss.on('connection', async (ws, req) => {
  console.log('2');
  var queryURL = url.parse(req.url, true);
  req.urlparams = queryURL.query;
  if (jwtController.validateJwt(req) == true) {
    let validData = await jwtController.validateJwtData(req);
    if (validData == true) {
      ws.jwtDetails = req.jwtDetails;
      connections.getConnections()[ws.jwtDetails.user_id] = ws;
    } else {
      console.log('Data not valid');
      ws.close();
      return;
    }
  } else {
    console.log('Token not valid');
    ws.close();
    return;
  }
  ws.onmessage = toEvent;

  ws.send('something');
});

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
    connections.getConnections()[ws.target.jwtDetails.user_id].send(JSON.stringify(reply));
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