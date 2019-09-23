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

describe('changeDesc', () => {
    test('should fail, if groupid is undefined', async () => {

    });

    test('should fail, if groupid is null', async () => {

    });

    test('should fail, if groupid is string', async () => {

    });

    test('should fail, if desc is undefined', async () => {

    });

    test('should fail, if desc is null', async () => {

    });

    test('should fail, if desc is number', async () => {

    });

    test('should fail, if user is not a member of the group', async () => {

    });

    test('should fail, and abort transaction on error', async () => {

    });

    test('should change the desc of the group', async () => {

    });
});