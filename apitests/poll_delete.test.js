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

describe('delete', () => {
    test('should fail, if pollid is undefined', async () => {

    });

    test('should fail, if pollid is null', async () => {

    });

    test('should fail, if pollid is string', async () => {

    });

    test('should fail, if user is not the creator of the poll', async () => {

    });

    test('should fail, if the poll has been shared to a group already', async () => {

    });

    test('should fail, if somebody already voted in the poll', async () => {

    });

    test('should fail, and abort transaction on error', async () => {

    });

    test('should delete the poll', async () => {

    });
});