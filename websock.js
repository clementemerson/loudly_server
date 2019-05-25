const fs = require('fs');
const https = require('https');
const WebSocket = require('ws');
var url = require('url');
var mongo = require('./db/mongo');

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


var connections = {};

wss.on('connection', async (ws, req) => {
  console.log('2');
  var queryURL = url.parse(req.url, true);
  req.urlparams = queryURL.query;
  if (jwtController.validateJwt(req) == true) {
    let validData = await jwtController.validateJwtData(req);
    if (validData == true) {
      ws.jwtDetails = req.jwtDetails;
      connections[ws.jwtDetails.user_id] = ws;
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
  let message = JSON.parse(ws.data);
  switch (message.module) {
    case users:
      UsersModuleHandlers.handle(message);
      break;
    case groups:
      GroupsModuleHandlers.handle(message);
      break;
    case polls:
      PollsModuleHandlers.handle(message);
      break;
    default:
      break;
  }
  console.log(message.module);
  console.log(message.event);
  console.log(message.phoneNumbers);
  let userInfos = await UserController.getUsersFromPhoneNumbers(message.phoneNumbers);
  connections[ws.target.jwtDetails.user_id].send(JSON.stringify(userInfos));
}

//Init connection with DB
mongo.initDbConnection(initServer);

function initServer() {
  server.listen(8080, () => {
    console.log("Websocket Server started at 8080");
  });
}