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

describe('removeUser', () => {
    test('should fail, if useridToRemove is undefined', async () => {

    });

    test('should fail, if useridToRemove is null', async () => {

    });

    test('should fail, if useridToRemove is string', async () => {

    });

    test('should fail, if groupid is undefined', async () => {

    });

    test('should fail, if groupid is null', async () => {

    });

    test('should fail, if groupid is string', async () => {

    });

    test('should fail, if user is not an ADMIN of the group', async () => {

    });

    test('should fail, if useridToRemove is not a member of the group', async () => {

    });

    test('should fail, and abort transaction on error', async () => {

    });

    test('should remove the user from the group in normal condition', async () => {

    });
});