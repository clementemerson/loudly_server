const expect = require('expect');

const errors = require('../helpers/errorstousers');
const success = require('../helpers/successtousers');

const webSocket = require('./websocket');
const WSS = require('../websock');

// For Mocking
const Users = require('../db/users');

// Port
let port = 9000;

beforeAll(async (done) => {
    console.log = () => { };
    let wss = await WSS.initMainServer(port, () => { });
    done();
});

beforeEach(() => { });

afterEach(() => { });

afterAll(() => { });

describe('getInfo', () => {
    test('should fail, if userids is not an array', async (done) => {
        // Tests
        const ws = await webSocket.init(port);
        await newFunction(done);
        // Test Function
        async function newFunction(done) {
            // Prepare data to server
            const messageid = Math.floor(Math.random() * 10000);
            const dataToServer = {
                module: 'users',
                event: 'getInfo',
                messageid: messageid,
                data: {
                    userids: 4538
                }
            };
            ws.send(JSON.stringify(dataToServer));
            // Wait for the result
            ws.on('message', function incoming(message) {
                const data = JSON.parse(message);
                // Expects
                if (data.Details.messageid === messageid) {
                    expect(data.Status).toEqual('Error');
                    expect(data.Details.data.status).toContain('Invalid message');
                    ws.close();
                    done();
                }
            });
        }
    });

    test('should fail, if userids array contains string', async (done) => {
        // Tests
        const ws = await webSocket.init(port);
        await newFunction(done);
        // Test Function
        async function newFunction(done) {
            // Prepare data to server
            const messageid = Math.floor(Math.random() * 10000);
            const dataToServer = {
                module: 'users',
                event: 'getInfo',
                messageid: messageid,
                data: {
                    userids: ['4538', 5234]
                }
            };
            ws.send(JSON.stringify(dataToServer));
            // Wait for the result
            ws.on('message', function incoming(message) {
                const data = JSON.parse(message);
                // Expects
                if (data.Details.messageid === messageid) {
                    expect(data.Status).toEqual('Error');
                    expect(data.Details.data.status).toContain('Invalid message');
                    ws.close();
                    done();
                }
            });
        }
    });

    test('should fail, if userids array has empty values', async (done) => {
        // Tests
        const ws = await webSocket.init(port);
        await newFunction(done);
        // Test Function
        async function newFunction(done) {
            // Prepare data to server
            const messageid = Math.floor(Math.random() * 10000);
            const dataToServer = {
                module: 'users',
                event: 'getInfo',
                messageid: messageid,
                data: {
                    userids: [4538, , 4534]
                }
            };
            ws.send(JSON.stringify(dataToServer));
            // Wait for the result
            ws.on('message', function incoming(message) {
                const data = JSON.parse(message);
                // Expects
                if (data.Details.messageid === messageid) {
                    expect(data.Status).toEqual('Error');
                    expect(data.Details.data.status).toContain('Invalid message');
                    ws.close();
                    done();
                }
            });
        }
    });

    test('should fail, on error', async (done) => {
        // Mocks
        Users.getUserInfoByUserIds = jest.fn().mockImplementationOnce(() => {
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
                event: 'getInfo',
                messageid: messageid,
                data: {
                    userids: [4538, 343]
                }
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

    test('should return userinfo for the userids', async (done) => {
        // Tests
        const ws = await webSocket.init(port);
        await newFunction(done);
        // Test Function
        async function newFunction(done) {
            // Prepare data to server
            const messageid = Math.floor(Math.random() * 10000);
            const dataToServer = {
                module: 'users',
                event: 'getInfo',
                messageid: messageid,
                data: {
                    userids: [4538, 343]
                }
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