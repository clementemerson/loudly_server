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

describe('getPolls', () => {
    test('should fail, if groupid is undefined', async () => {

    });

    test('should fail, if groupid is null', async () => {

    });

    test('should fail, if groupid is string', async () => {

    });

    test('should fail, if user is not a member of the group', async () => {

    });

    test('should fail, on error', async () => {

    });

    test('should return info about the polls in the group', async () => {

    });
});