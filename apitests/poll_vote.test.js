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

describe('vote', () => {
    test('should fail, if pollid is undefined', async () => {

    });

    test('should fail, if pollid is null', async () => {

    });

    test('should fail, if pollid is string', async () => {

    });

    test('should fail, if option is undefined', async () => {

    });

    test('should fail, if option is null', async () => {

    });

    test('should fail, if option is string', async () => {

    });

    test('should fail, if secretVote is undefined', async () => {

    });

    test('should fail, if secretVote is null', async () => {

    });

    test('should fail, if secretVote is string', async () => {

    });

    test('should fail, if poll does not exist', async () => {

    });

    test('should fail, if user voted already', async () => {

    });

    test('should fail, and abort transaction on error', async () => {

    });

    test('should cast the vote', async () => {

    });
});