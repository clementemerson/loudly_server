const expect = require('expect');

const redClient = require('../redis/redclient');
const mongo = require('../db/mongo');

const errors = require('../helpers/errorstousers');
const success = require('../helpers/successtousers');

const dbTransactions = require('../db/session');

beforeAll(async () => {
  await redClient.initRedisClient();
  await mongo.initDbConnection();
  console.log = () => { };
});

beforeEach(() => {
  dbTransactions.start = jest.fn();
  dbTransactions.commit = jest.fn();
  dbTransactions.abort = jest.fn();
});

afterEach(() => {
});

afterAll(() => {
});
