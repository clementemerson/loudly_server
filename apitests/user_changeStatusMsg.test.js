const expect = require('expect');
const testUtil = require('../testutil/testUtil');

const errors = require('../helpers/errorstousers');
const success = require('../helpers/successtousers');

beforeAll(async () => {
    console.log = () => { };
});

beforeEach(() => { });

afterEach(() => { });

afterAll(() => { });

describe('changeStatusMsg', () => {
    test('should fail, if statusmsg is undefined', async () => {

    });

    test('should fail, if statusmsg is null', async () => {

    });

    test('should fail, if statusmsg is not a string', async () => {

    });

    test('should fail, on error', async () => {

    });

    test('should abort transaction, if any error before commit', async () => {

    });

    test('should change the statusmsg and return success', async () => {

    });
});