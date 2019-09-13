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

describe('shareToGroup', () => {
    test('should fail, if pollid is undefined', async () => {

    });

    test('should fail, if pollid is null', async () => {

    });

    test('should fail, if pollid is string', async () => {

    });

    test('should fail, if groupids is undefined', async () => {

    });

    test('should fail, if groupids is null', async () => {

    });

    test('should fail, if groupids is not an array', async () => {

    });

    test('should fail, if groupids has a string in array', async () => {

    });

    test('should fail, if user does not have the poll', async () => {

    });

    test('should fail, and abort transaction on error', async () => {

    });

    test('should share the poll in all the given groups', async () => {

    });

    test('should filter the groups where the user is not a member', async () => {

    });

    test('should filter the groups which has the poll already', async () => {

    });
});