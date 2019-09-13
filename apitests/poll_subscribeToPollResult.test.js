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

describe('subscribeToPollResult', () => {
    test('should fail, if pollid is undefined', async () => {

    });

    test('should fail, if pollid is null', async () => {

    });

    test('should fail, if pollid is string', async () => {

    });

    test('should fail, if the user does not have the poll', async () => {

    });

    test('should fail, if the user did not cast his vote yet', async () => {

    });

    test('should fail, on error', async () => {

    });

    test('should subscribe to the pollresult-updates', async () => {

    });
});