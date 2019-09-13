const expect = require('expect');
const testUtil = require('./testutil');

const errors = require('../helpers/errorstousers');
const success = require('../helpers/successtousers');

beforeAll(async () => {
    console.log = () => { };
});

beforeEach(() => { });

afterEach(() => { });

afterAll(() => { });

describe('login to main server', () => {
    test('should fail if token is undefined', async () => {

    });

    test('should fail if token is not a valid JWT', async () => {

    });

    test('should fail if token data mismatch with the server', async () => {

    });

    test('should login if token is valid and authentic', async () => {

    });
});

describe('sending messages to main server', () => {
    test('should fail, if module is undefined', async () => {

    });

    test('should fail, if module is null', async () => {

    });

    test('should fail, if module is number', async () => {

    });

    test('should fail, if module is unknown', async () => {

    });

    test('should fail, if event is undefined', async () => {

    });

    test('should fail, if event is null', async () => {

    });

    test('should fail, if event is number', async () => {

    });

    test('should fail, if messageid is undefined', async () => {

    });

    test('should fail, if messageid is null', async () => {

    });

    test('should fail, if messageid is not a number or string', async () => {

    });
});

describe('login to fanout server', () => {
    test('should fail if token is undefined', async () => {

    });

    test('should fail if token is not a valid JWT', async () => {

    });

    test('should fail if token data mismatch with the server', async () => {

    });

    test('should login if token is valid and authentic', async () => {

    });
});