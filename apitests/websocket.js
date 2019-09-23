const WebSocket = require('ws');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyMDA0LCJ1c2VyX3NlY3JldCI6InBLUzd4dzRHZTVEWjh4eDdrUUtFRWtjaSIsInVzZXJfcGhvbmVudW1iZXIiOiIrOTE5ODg0Mzg2NDg0IiwiaWF0IjoxNTY5MjEwMTU5fQ.BAKwMvTvJZtVgM-Mcpgcx4gQ0gNwN8FLcshY0GSACuE';
let ws;

module.exports = {
    init: async (port) => {
        return new Promise((resolve, reject) => {
            ws = new WebSocket('ws://localhost:' + port + '?token=' + token);
            //ws = new WebSocket('ws://localhost:8080?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyMDA0LCJ1c2VyX3NlY3JldCI6Im9lekdkQlhtbFBYUjhQbW1JcjBMM3dobCIsInVzZXJfcGhvbmVudW1iZXIiOiIrOTE5ODg0Mzg2NDg0IiwiaWF0IjoxNTY4MzY2OTkyfQ.wSD6K99LuX9-A4zm764l9CMX5zu-c44HFPJJ300pNIE');
            ws.on('open', function open() {
                setTimeout(() => {
                    resolve(ws);
                }, 500);
            });

            ws.on('close', function close() {
                // console.log('disconnected');
                // if (!!disconnect)
                //     disconnect();
            });

            ws.on('error', function error(err) {
                console.log(err);
            });
        });
    },
    close: async () => {
        ws.close();
    }
}
