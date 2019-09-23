const expect = require('expect');

const errors = require('../helpers/errorstousers');
const success = require('../helpers/successtousers');

const webSocket = require('./websocket');
const WSS = require('../websock');
const mongo = require('../testutil/mongo_connection');

// For Mocking
const UserPolls = require('../db/userpolls');

// Port
let port = 9001;

beforeAll(async (done) => {
    console.log = () => { };
    await WSS.initMainServer(port, () => { });
    await mongo.initDbConnection();
    // red = await testRedis.initTestRedis();
    // await redClient.initRedisClient('loudly.loudspeakerdev.net', 6379, 5);
    done();
});

beforeEach(() => { });

afterEach(() => { });

afterAll(async () => {
    // await webSocket.close();
});

describe('getPolls', () => {
    test('should fail, on error', async (done) => {
        // Mocks
        UserPolls.getPolls = jest.fn().mockImplementationOnce(() => {
            throw new Error('');
        });
        // Tests
        const ws = await webSocket.init(port);
        await newFunction(done);
        // Test Function
        async function newFunction(done) {
            // Prepare data to server
            const messageid = Math.floor(Math.random() * 10000);
            const dataToServer = {
                module: 'users',
                event: 'getPolls',
                messageid: messageid
            };
            ws.send(JSON.stringify(dataToServer));
            // Wait for the result
            ws.on('message', function incoming(message) {
                console.log(message);
                const data = JSON.parse(message);
                // Expects
                if (data.Details.messageid === messageid) {
                    expect(data.Status).toEqual('Error');
                    expect(data.Details.data.status).toContain(errors.internalError.message);
                    ws.close();
                    done();
                }
            });
        }
    });

    test('should return all polls of the user', async (done) => {
        // Tests
        const ws = await webSocket.init(port);
        await newFunction(done);
        // Test Function
        async function newFunction(done) {
            // Prepare data to server
            const messageid = Math.floor(Math.random() * 10000);
            const dataToServer = {
                module: 'users',
                event: 'getPolls',
                messageid: messageid
            };
            ws.send(JSON.stringify(dataToServer));
            // Wait for the result
            ws.on('message', function incoming(message) {
                console.log(message);
                const data = JSON.parse(message);
                // Expects
                if (data.Details.messageid === messageid) {
                    expect(data.Status).toEqual('Success');
                    ws.close();
                    done();
                }
            });
        }
    });
});
