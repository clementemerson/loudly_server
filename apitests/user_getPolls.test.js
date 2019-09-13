const expect = require('expect');
const WebSocket = require('ws');

const errors = require('../helpers/errorstousers');
const success = require('../helpers/successtousers');

const webSocket = require('./websocket');

let ws;

function onMessage(data) {
    console.log(data);
}

beforeAll(async (done) => {

    done();
    // console.log = () => { };
});

beforeEach(() => { });

afterEach(() => { });

afterAll(async () => {
    await webSocket.close();
});

describe('getPolls', () => {
    test('should fail, on error', async (done) => {
        console.log('executing tests');
        ws = await webSocket.init();
        const messageid = 4641;
        console.log('before send');
        ws.send('{"module":"users", "event":"getPolls", "messageid":4641}');
        ws.on('message', function incoming(message) {
            console.log(message);
            const data = JSON.parse(message);
            if (data.Details.messageid === messageid) {
                console.log('calling done');
                done();
            } else {
                console.log('not done');
            }
        });
    });

    test('should return all polls of the user', async () => {

    });
});