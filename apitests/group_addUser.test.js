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

describe('addUser', () => {
    test('should fail, if useridsToAdd is undefined', async () => {

    });

    test('should fail, if useridsToAdd is null', async () => {

    });

    test('should fail, if useridsToAdd array has string in it', async () => {

    });

    test('should fail, if groupid is undefined', async () => {

    });

    test('should fail, if groupid is null', async () => {

    });

    test('should fail, if groupid is string', async () => {

    });

    test('should fail, if permission is undefined', async () => {

    });

    test('should fail, if permission is null', async () => {

    });

    test('should fail, if permission is number', async () => {

    });

    test('should fail, if permission is string but invalid', async () => {

    });

    test('should fail, if user is not an ADMIN of the group', async () => {

    });

    test('should fail, and abort transaction on error', async () => {

    });

    test('should add all users to the group in normal condition', async () => {

    });

    test('should filter users whose accounts are not exist', async () => {

    });

    test('should filter users who are already member of the group', async () => {

    });

    test('should fail, if no users need to be added to the group', async () => {

    });
});