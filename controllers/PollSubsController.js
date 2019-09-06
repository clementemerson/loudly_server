const VError = require('verror');
const assert = require('assert');
const check = require('check-types');

const errors = require('../helpers/errorstousers');
const success = require('../helpers/successtousers');

const redClient = require('../redis/redclient');
const keyPrefix = require('../redis/key_prefix');
const redHelper = require('../redis/redhelper');

const connections = require('../websockets/connections');

module.exports = {
  /**
       * To subscribe to the pollresult.
       * Subscribed users will get notified by the fanout process.
       * The subscription will expire in a specific time, if the user
       * does not unsubscribe it.
       *
       * Tested on: 17-Aug-2019
       * {"module":"polls", "event":"subscribeToPollResult", "messageid":8658, "data":{"pollid":1023}}
       *
       * @param {number} userid    ID of the user
       * @param {number} pollid    ID of the poll
       * @return {Status}
       *
       * @throws {errors.errorUserNotVoted}
       *  When the user subscribes for the result before casting his vote
       */
  subscribeToPollResult: async (userid, pollid) => {
    console.log('PollController.subscribeToPollResult');
    assert.ok(check.number(userid),
        'argument \'userid\' must be a number');
    assert.ok(check.number(pollid),
        'argument \'pollid\' must be a number');

    try {
      // Prepare data
      const data = {
        user_id: userid,
        pollid: pollid,
      };

      // Check if the user has voted already
      const isUserVoted = await redClient.sismember(
          keyPrefix.pollVotedUsers + data.pollid, data.user_id);
      if (isUserVoted == false) {
        throw new VError(errors.errorUserNotVoted.message);
      }

      // Adding subscription
      const score = (new Date()).getTime();
      redClient.zadd(keyPrefix.pollSubsription + data.pollid,
          data.user_id, score);

      // Send latest result to the user
      const pollResult = await redHelper.getPollResult(data.pollid);
      connections.inform(data.user_id, pollResult);

      const replyData = {
        status: success.userSubscribedToPollResult,
      };
      return replyData;
    } catch (err) {
      errors.wrapError(err);
    }
  },

  /**
         * Unsubscribe to the poll result, if the user subscribed for it.
         * Else, no change.
         *
         * Tested on: Pending
         * {"module":"polls", "event":"unSubscribeToPollResult", "messageid":8658, "data":{"pollid":1023}}
         *
         * @param {number} userid    ID of the user
         * @param {number} pollid    ID of the poll
         * @return {Status}
         */
  unSubscribeToPollResult: async (userid, pollid) => {
    console.log('PollController.unSubscribeToPollResult');
    assert.ok(check.number(userid),
        'argument \'userid\' must be a number');
    assert.ok(check.number(pollid),
        'argument \'pollid\' must be a number');

    try {
      // Prepare data
      const data = {
        user_id: userid,
        pollid: pollid,
      };

      redClient.srem(keyPrefix.pollSubsription + data.pollid, data.user_id);

      const replyData = {
        status: success.userUnSubscribedToPollResult,
      };
      return replyData;
    } catch (err) {
      errors.wrapError(err);
    }
  },
};
