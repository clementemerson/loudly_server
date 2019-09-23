const expect = require('expect');

const errors = require('../helpers/errorstousers');
const success = require('../helpers/successtousers');

const webSocket = require('./websocket');
const WSS = require('../websock');

// For Mocking
const Users = require('../db/users');
const dbTransactions = require('../db/session');
let startTransaction, commitTransaction, abortTransaction;

// Port
let port = 9003;

beforeAll(async (done) => {
    console.log = () => { };
    let wss = await WSS.initMainServer(port, () => { });
    done();
});

beforeEach(() => { 
    startTransaction = jest.spyOn(dbTransactions, 'start');
    commitTransaction = jest.spyOn(dbTransactions, 'commit');
    abortTransaction = jest.spyOn(dbTransactions, 'abort');
});

afterEach(() => { 
    startTransaction.mockRestore();
    commitTransaction.mockRestore();
    abortTransaction.mockRestore();
});

afterAll(() => { });

describe('changeName', () => {
    test('should fail, if name is undefined', async (done) => {
        // Tests
        const ws = await webSocket.init(port);
        await newFunction(done);
        // Test Function
        async function newFunction(done) {
            // Prepare data to server
            const messageid = Math.floor(Math.random() * 10000);
            const dataToServer = {
                module: 'users',
                event: 'changeName',
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
                    expect(data.Details.data.status).toContain('Invalid message');
                    expect(startTransaction).not.toHaveBeenCalled();
                    expect(commitTransaction).not.toHaveBeenCalled();
                    expect(abortTransaction).not.toHaveBeenCalled();
                    ws.close();
                    done();
                }
            });
        }
    });

    test('should fail, if name is null', async (done) => {
        // Tests
        const ws = await webSocket.init(port);
        await newFunction(done);
        // Test Function
        async function newFunction(done) {
            // Prepare data to server
            const messageid = Math.floor(Math.random() * 10000);
            const dataToServer = {
                module: 'users',
                event: 'changeName',
                messageid: messageid,
                data: {
                    name: null
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
                    expect(data.Details.data.status).toContain('Invalid message');
                    expect(startTransaction).not.toHaveBeenCalled();
                    expect(commitTransaction).not.toHaveBeenCalled();
                    expect(abortTransaction).not.toHaveBeenCalled();
                    ws.close();
                    done();
                }
            });
        }
    });

    test('should fail, if name is not a string', async (done) => {
        // Tests
        const ws = await webSocket.init(port);
        await newFunction(done);
        // Test Function
        async function newFunction(done) {
            // Prepare data to server
            const messageid = Math.floor(Math.random() * 10000);
            const dataToServer = {
                module: 'users',
                event: 'changeName',
                messageid: messageid,
                data: {
                    name: 3242354
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
                    expect(data.Details.data.status).toContain('Invalid message');
                    expect(startTransaction).not.toHaveBeenCalled();
                    expect(commitTransaction).not.toHaveBeenCalled();
                    expect(abortTransaction).not.toHaveBeenCalled();
                    ws.close();
                    done();
                }
            });
        }
    });

    test('should fail, on error', async (done) => {
        // Mocks
        Users.changeName = jest.fn().mockImplementationOnce(() => {
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
                event: 'changeName',
                messageid: messageid,
                data: {
                    name: '3242354'
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
                    expect(startTransaction).toHaveBeenCalled();
                    expect(commitTransaction).not.toHaveBeenCalled();
                    expect(abortTransaction).toHaveBeenCalled();
                    ws.close();
                    done();
                }
            });
        }
    });

    test('should change the name and return success', async (done) => {
        // Tests
        const ws = await webSocket.init(port);
        await newFunction(done);
        // Test Function
        async function newFunction(done) {
            // Prepare data to server
            const messageid = Math.floor(Math.random() * 10000);
            const dataToServer = {
                module: 'users',
                event: 'changeName',
                messageid: messageid,
                data: {
                    name: '3242354'
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
                    expect(startTransaction).toHaveBeenCalled();
                    expect(commitTransaction).toHaveBeenCalled();
                    expect(abortTransaction).not.toHaveBeenCalled();
                    ws.close();
                    done();
                }
            });
        }
    });
});