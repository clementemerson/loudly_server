const VError = require('verror');
const assert = require('assert');
const check = require('check-types');

const errors = require('../helpers/errorstousers');

const UserController = require('../controllers/UserController');

module.exports = {
  handle: async (message) => {
    if (!message) {
      throw new Error('Invalid Arguments');
    }

    let reply;
    switch (message.event) {
      case 'getUsersFromPhoneNumbers':
        reply = await getUsersFromPhoneNumbers(message);
        break;
      case 'getGroups':
        reply = await getGroups(message);
        break;
      case 'getPolls':
        reply = await getPolls(message);
        break;
      case 'getInfo':
        reply = await getInfo(message);
        break;
      case 'changeName':
        reply = await changeName(message);
        break;
      case 'changeStatusMsg':
        reply = await changeStatusMsg(message);
        break;
      default:
        throw new VError(errors.unknownEvent.message);
    }
    return reply;
  },
};

/**
 * Handler
 *
 * @param {*} message
 * @return {*}
 */
async function changeStatusMsg(message) {
  assert.ok(check.all(check.map(message, {
    user_id: check.number,
    data: {
      statusmsg: check.string,
    },
  })), 'Invalid message');
  reply = await UserController.changeStatusMsg(message.user_id,
      message.data.statusmsg);
  return reply;
}

/**
 * Handler
 *
 * @param {*} message
 * @return {*}
 */
async function changeName(message) {
  assert.ok(check.all(check.map(message, {
    user_id: check.number,
    data: {
      name: check.string,
    },
  })), 'Invalid message');
  reply = await UserController.changeName(message.user_id,
      message.data.name);
  return reply;
}

/**
 * Handler
 *
 * @param {*} message
 * @return {*}
 */
async function getInfo(message) {
  assert.ok(check.all(check.map(message, {
    data: {
      user_id: check.array.of.number,
    },
  })), 'Invalid message');
  reply = await UserController.getInfo(message.data.userids);
  return reply;
}

/**
 * Handler
 *
 * @param {*} message
 * @return {*}
 */
async function getPolls(message) {
  assert.ok(check.all(check.map(message, {
    user_id: check.number,
  })), 'Invalid message');
  reply = await UserController.getPolls(message.user_id);
  return reply;
}

/**
 * Handler
 *
 * @param {*} message
 * @return {*}
 */
async function getGroups(message) {
  assert.ok(check.all(check.map(message, {
    user_id: check.number,
  })), 'Invalid message');
  reply = await UserController.getGroups(message.user_id);
  return reply;
}

/**
 * Handler
 *
 * @param {*} message
 * @return {*}
 */
async function getUsersFromPhoneNumbers(message) {
  assert.ok(check.all(check.map(message, {
    user_id: check.number,
    data: {
      phoneNumbers: check.array.of.nonEmptyString,
    },
  })), 'Invalid message');
  reply = await UserController.getUsersFromPhoneNumbers(message.user_id,
      message.data.phoneNumbers);
  return reply;
}
