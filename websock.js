const fs = require('fs');
const https = require('http');
const WebSocket = require('ws');
 
const server = https.createServer();
const wss = new WebSocket.Server({ server });

var connections = [];
 
wss.on('connection', function connection(ws, req) {
    connections.push(ws);
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    ws.send('fmdofjdsfdsfn')

    connections.forEach(element => {
        element.send(message);
    });
  });
 
  ws.send('something');
});
 
server.listen(8080, () => {
    console.log("Websocket Server started at 8080");

});