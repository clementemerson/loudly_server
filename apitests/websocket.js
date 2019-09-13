const WebSocket = require('ws');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyMDA0LCJ1c2VyX3NlY3JldCI6Im9lekdkQlhtbFBYUjhQbW1JcjBMM3dobCIsInVzZXJfcGhvbmVudW1iZXIiOiIrOTE5ODg0Mzg2NDg0IiwiaWF0IjoxNTY4MzY2OTkyfQ.wSD6K99LuX9-A4zm764l9CMX5zu-c44HFPJJ300pNIE';
let ws;

module.exports = {
    init: async () => {
        return new Promise((resolve, reject) => {
            ws = new WebSocket('ws://localhost:8080?token=' + token);
            //ws = new WebSocket('ws://localhost:8080?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyMDA0LCJ1c2VyX3NlY3JldCI6Im9lekdkQlhtbFBYUjhQbW1JcjBMM3dobCIsInVzZXJfcGhvbmVudW1iZXIiOiIrOTE5ODg0Mzg2NDg0IiwiaWF0IjoxNTY4MzY2OTkyfQ.wSD6K99LuX9-A4zm764l9CMX5zu-c44HFPJJ300pNIE');
            ws.on('open', async function open() {
                console.log('connected');
                ws.send(Date.now());
                resolve(ws);
            });

            ws.on('close', async function close() {
                // console.log('disconnected');
                // if (!!disconnect)
                //     disconnect();
            });
        });
    },
    close: async () => {
        ws.close();
    }
}
