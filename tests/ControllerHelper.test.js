const testUtil = require('../testutil/testUtil');

const dbTransactions = require('../db/session');

// Testing
const ControllerHelper = require('../controllers/ControllerHelper');

beforeAll(async () => {
  console.log = () => {};
});

beforeEach(() => {
  dbTransactions.start = jest.fn();
  dbTransactions.commit = jest.fn();
  dbTransactions.abort = jest.fn();
});

afterEach(() => {});

afterAll(() => {});

describe('informGroupUpdate', () => {
    testUtil.shouldExist(ControllerHelper.informGroupUpdate);
    testUtil.shouldBeAFunction(ControllerHelper.informGroupUpdate);
});

describe('informGroupUserUpdate', () => {
    testUtil.shouldExist(ControllerHelper.informGroupUserUpdate);
    testUtil.shouldBeAFunction(ControllerHelper.informGroupUserUpdate);
});

describe('informNewPollInGroup', () => {
    testUtil.shouldExist(ControllerHelper.informNewPollInGroup);
    testUtil.shouldBeAFunction(ControllerHelper.informNewPollInGroup);
});
