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

describe('create', () => {
    test('should fail, if name is undefined', async () => {

    });

    test('should fail, if name is null', async () => {

    });

    test('should fail, if name is number', async () => {

    });

    test('should fail, if desc is undefined', async () => {

    });

    test('should fail, if desc is null', async () => {

    });

    test('should fail, if desc is number', async () => {

    });

    test('should fail, if userids is undefined', async () => {

    });

    test('should fail, if userids is null', async () => {

    });

    test('should fail, if userids is not an array', async () => {

    });

    test('should fail, if userids has string in it', async () => {

    });

    test('should fail, on error', async () => {

    });

    test('should fail, and abort transaction on error', async () => {

    });

    test('should create a group', async () => {

    });
});