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

describe('getUsersVotesByPoll', () => {
    test('should fail, if pollid is undefined', async () => {

    });

    test('should fail, if pollid is null', async () => {

    });

    test('should fail, if pollid is string', async () => {

    });

    test('should fail, if userids is undefined', async () => {

    });

    test('should fail, if userids is null', async () => {

    });

    test('should fail, if userids is not an array', async () => {

    });

    test('should fail, if userids has a string in array', async () => {

    });

    test('should fail, if the user does not have the poll', async () => {

    });

    test('should fail, if the user did not cast his vote yet', async () => {

    });

    test('should fail, on error', async () => {

    });

    test('should return the vote data', async () => {

    });
});