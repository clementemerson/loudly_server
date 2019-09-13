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

describe('getInfo', () => {
    test('should fail, if pollids is undefined', async () => {

    });

    test('should fail, if pollids is null', async () => {

    });

    test('should fail, if pollids is not an array', async () => {

    });

    test('should fail, if pollids has a string in array', async () => {

    });

    test('should fail, on error', async () => {

    });

    test('should return pollinfo of the given pollids', async () => {

    });
});