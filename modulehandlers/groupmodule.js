const VError = require('verror');
const assert = require('assert');
const check = require('check-types');

const errors = require('../helpers/errorstousers');

const GroupController = require('../controllers/GroupController');
const GroupUserController = require('../controllers/GroupUserController');

module.exports = {
  handle: async (message) => {
    if (!message || !message.event) {
      throw new Error('Invalid Arguments');
    }

    let reply;
    switch (message.event) {
      case 'create':
        reply = await create(message);
        break;
      case 'changeTitle':
        reply = await changeTitle(message);
        break;
      case 'changeDesc':
        reply = await changeDesc(message);
        break;
      case 'delete':
        reply = await handleDelete(message);
        break;
      case 'getMyGroupsInfo':
        reply = await getMyGroupsInfo(message);
        break;
      case 'changeAvatar':
        // reply = await GroupController.changeAvatar(message);
        break;
      case 'getInfo':
        reply = await getInfo(message);
        break;
      case 'getPolls':
        reply = await getPolls(message);
        break;
      case 'addUser':
        reply = await addUser(message);
        break;
      case 'changeUserPermission':
        reply = await changeUserPermission(message);
        break;
      case 'removeUser':
        reply = await removeUser(message);
        break;
      case 'getUsersOfGroup':
        reply = await getUsersOfGroup(message);
        break;
      case 'getGroupUpdates':
        reply = await GroupController.getGroupUpdates(message);
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
async function getUsersOfGroup(message) {
  assert.ok(
      check.all(
          check.map(message, {
            user_id: check.number,
            data: {
              groupid: check.number,
            },
          })
      ),
      'Invalid message'
  );
  reply = await GroupUserController.getUsersOfGroup(
      message.user_id,
      message.data.groupid
  );
  return reply;
}

/**
 * Handler
 *
 * @param {*} message
 * @return {*}
 */
async function removeUser(message) {
  assert.ok(
      check.all(
          check.map(message, {
            user_id: check.number,
            data: {
              user_id: check.number,
              groupid: check.number,
            },
          })
      ),
      'Invalid message'
  );
  reply = await GroupUserController.removeUser(
      message.user_id,
      message.data.user_id,
      message.data.groupid
  );
  return reply;
}

/**
 * Handler
 *
 * @param {*} message
 * @return {*}
 */
async function changeUserPermission(message) {
  assert.ok(
      check.all(
          check.map(message, {
            user_id: check.number,
            data: {
              user_id: check.number,
              groupid: check.number,
              permission: check.string,
            },
          })
      ),
      'Invalid message'
  );
  reply = await GroupUserController.changeUserPermission(
      message.user_id,
      message.data.user_id,
      message.data.groupid,
      message.data.permission
  );
  return reply;
}

/**
 * Handler
 *
 * @param {*} message
 * @return {*}
 */
async function addUser(message) {
  assert.ok(
      check.all(
          check.map(message, {
            user_id: check.number,
            data: {
              user_id: check.number,
              groupid: check.number,
              permission: check.in(['ADMIN', 'USER']),
            },
          })
      ),
      'Invalid message'
  );
  reply = await GroupUserController.addUser(
      message.user_id,
      message.data.user_id,
      message.data.groupid,
      message.data.permission
  );
  return reply;
}

/**
 * Handler
 *
 * @param {*} message
 * @return {*}
 */
async function getPolls(message) {
  assert.ok(
      check.all(
          check.map(message, {
            user_id: check.number,
            data: {
              groupid: check.number,
            },
          })
      ),
      'Invalid message'
  );
  reply = await GroupController.getPolls(message.user_id, message.data.groupid);
  return reply;
}

/**
 * Handler
 *
 * @param {*} message
 * @return {*}
 */
async function getInfo(message) {
  assert.ok(
      check.all(
          check.map(message, {
            data: {
              groupids: check.array.of.number,
            },
          })
      ),
      'Invalid message'
  );
  reply = await GroupController.getInfo(message.data.groupids);
  return reply;
}

/**
 * Handler
 *
 * @param {*} message
 * @return {*}
 */
async function getMyGroupsInfo(message) {
  assert.ok(
      check.all(
          check.map(message, {
            user_id: check.number,
          })
      ),
      'Invalid message'
  );
  reply = await GroupController.getMyGroupsInfo(message.user_id);
  return reply;
}

/**
 * Handler
 *
 * @param {*} message
 * @return {*}
 */
async function handleDelete(message) {
  assert.ok(
      check.all(
          check.map(message, {
            user_id: check.number,
            data: {
              groupid: check.number,
            },
          })
      ),
      'Invalid message'
  );
  reply = await GroupController.delete(message.user_id, message.data.groupid);
  return reply;
}

/**
 * Handler
 *
 * @param {*} message
 * @return {*}
 */
async function changeDesc(message) {
  assert.ok(
      check.all(
          check.map(message, {
            user_id: check.number,
            data: {
              groupid: check.number,
              desc: check.string,
            },
          })
      ),
      'Invalid message'
  );
  reply = await GroupController.changeDesc(
      message.user_id,
      message.data.groupid,
      message.data.desc
  );
  return reply;
}

/**
 * Handler
 *
 * @param {*} message
 * @return {*}
 */
async function changeTitle(message) {
  assert.ok(
      check.all(
          check.map(message, {
            user_id: check.number,
            data: {
              groupid: check.number,
              name: check.string,
            },
          })
      ),
      'Invalid message'
  );
  reply = await GroupController.changeTitle(
      message.user_id,
      message.data.groupid,
      message.data.name
  );
  return reply;
}

/**
 * Handler
 *
 * @param {*} message
 * @return {*}
 */
async function create(message) {
  assert.ok(
      check.all(
          check.map(message, {
            user_id: check.number,
            data: {
              name: check.string,
              desc: check.string,
            },
          })
      ),
      'Invalid message'
  );
  reply = await GroupController.create(
      message.user_id,
      message.data.name,
      message.data.desc
  );
  return reply;
}
