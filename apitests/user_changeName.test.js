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

describe('changeName', () => {
    test('should fail, if name is undefined', async () => {

    });

    test('should fail, if name is null', async () => {

    });

    test('should fail, if name is not a string', async () => {

    });

    test('should fail, on error', async () => {

    });

    test('should abort transaction, if any error before commit', async () => {

    });

    test('should change the name and return success', async () => {

    });
});