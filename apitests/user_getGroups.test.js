const expect = require('expect');

const errors = require('../helpers/errorstousers');
const success = require('../helpers/successtousers');

const webSocket = require('./websocket');
const WSS = require('../websock');

// For Mocking
const GroupUsers = require('../db/groupusers');

// Port
let port = 9002;

beforeAll(async (done) => {
    console.log = () => { };
    let wss = await WSS.initMainServer(port, () => { });
    done();
});

beforeEach(() => { });

afterEach(() => { });

afterAll(() => { });

describe('getGroups', () => {
    test('should fail, on error', async (done) => {
        // Mocks
        GroupUsers.getGroupsOfUser = jest.fn().mockImplementationOnce(() => {
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
                event: 'getGroups',
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

    test('should return groupinfo of the user', async (done) => {
        // Tests
        const ws = await webSocket.init(port);
        await newFunction(done);
        // Test Function
        async function newFunction(done) {
            // Prepare data to server
            const messageid = Math.floor(Math.random() * 10000);
            const dataToServer = {
                module: 'users',
                event: 'getGroups',
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