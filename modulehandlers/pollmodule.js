const VError = require('verror');
const assert = require('assert');
const check = require('check-types');

const errors = require('../helpers/errorstousers');

const PollController = require('../controllers/PollController');
const PollOpController = require('../controllers/PollOpController');
const PollSubsController = require('../controllers/PollSubsController');

module.exports = {
  handle: async (message) => {
    if (!message) {
      throw new Error('Invalid Arguments');
    }

    let reply;
    switch (message.event) {
      case 'create':
        await PollController.create(message);
        break;
      case 'delete':
        reply = await handleDelete(message);
        break;
      case 'vote':
        reply = await vote(message);
        break;
      case 'shareToGroup':
        reply = await shareToGroup(message);
        break;
      case 'getMyPollsInfo':
        reply = await getMyPollsInfo(message);
        break;
      case 'getInfo':
        reply = await getInfo(message);
        break;
      case 'getUsersVotesByPoll':
        reply = await getUsersVotesByPoll(message);
        break;
      case 'syncPollResults':
        reply = await PollOpController.syncPollResults(message);
        break;
      case 'subscribeToPollResult':
        reply = await subscribeToPollResult(message);
        break;
      case 'unSubscribeToPollResult':
        reply = await unSubscribeToPollResult(message);
        break;
      case 'getMyVotes':
        reply = await getMyVotes(message);
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
async function getMyVotes(message) {
  assert.ok(
      check.all(
          check.map(message, {
            user_id: check.number,
          })
      ),
      'Invalid message'
  );
  reply = await PollOpController.getMyVotes(message.user_id);
  return reply;
}

/**
 * Handler
 *
 * @param {*} message
 * @return {*}
 */
async function unSubscribeToPollResult(message) {
  assert.ok(
      check.all(
          check.map(message, {
            user_id: check.number,
            data: {
              pollid: check.number,
            },
          })
      ),
      'Invalid message'
  );
  reply = await PollController.unSubscribeToPollResult(
      message.user_id,
      message.data.pollid
  );
  return reply;
}

/**
 * Handler
 *
 * @param {*} message
 * @return {*}
 */
async function subscribeToPollResult(message) {
  assert.ok(
      check.all(
          check.map(message, {
            user_id: check.number,
            data: {
              pollid: check.number,
            },
          })
      ),
      'Invalid message'
  );
  reply = await PollSubsController.subscribeToPollResult(
      message.user_id,
      message.data.pollid
  );
  return reply;
}

/**
 * Handler
 *
 * @param {*} message
 * @return {*}
 */
async function getUsersVotesByPoll(message) {
  assert.ok(
      check.all(
          check.map(message, {
            user_id: check.number,
            data: {
              pollid: check.number,
              user_ids: check.array.of.number,
            },
          })
      ),
      'Invalid message'
  );
  reply = await PollSubsController.getUsersVotesByPoll(
      message.user_id,
      message.data.pollid,
      message.data.user_ids
  );
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
            user_id: check.number,
            data: {
              pollids: check.array.of.number,
            },
          })
      ),
      'Invalid message'
  );
  reply = await PollController.getInfo(message.user_id, message.data.pollids);
  return reply;
}

/**
 * Handler
 *
 * @param {*} message
 * @return {*}
 */
async function getMyPollsInfo(message) {
  assert.ok(
      check.all(
          check.map(message, {
            user_id: check.number,
          })
      ),
      'Invalid message'
  );
  reply = await PollController.getMyPollsInfo(message.user_id);
  return reply;
}

/**
 * Handler
 *
 * @param {*} message
 * @return {*}
 */
async function shareToGroup(message) {
  assert.ok(
      check.all(
          check.map(message, {
            user_id: check.number,
            data: {
              pollid: check.number,
              groupid: check.number,
            },
          })
      ),
      'Invalid message'
  );
  reply = await PollOpController.shareToGroup(
      message.user_id,
      message.data.pollid,
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
async function vote(message) {
  assert.ok(
      check.all(
          check.map(message, {
            user_id: check.number,
            data: {
              pollid: check.number,
              optionindex: check.number,
              secretvote: check.boolean,
            },
          })
      ),
      'Invalid message'
  );
  reply = await PollController.vote(
      message.user_id,
      message.data.pollid,
      message.data.optionindex,
      message.data.secretvote
  );
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
              pollid: check.number,
            },
          })
      ),
      'Invalid message'
  );
  const reply = await PollController.delete(
      message.user_id,
      message.data.pollid
  );
  return reply;
}
