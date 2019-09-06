const VError = require('verror');
const assert = require('assert');
const check = require('check-types');

const errors = require('../helpers/errorstousers');
const success = require('../helpers/successtousers');
const replyHelper = require('../helpers/replyhelper');

const dbTransactions = require('../db/session');
const PollData = require('../db/polldata');
const PollVoteData = require('../db/pollvotedata');
const PollResult = require('../db/pollresult');
const GroupPolls = require('../db/grouppolls');
const UserPolls = require('../db/userpolls');
const GroupUsers = require('../db/groupusers');

const ControllerHelper = require('./ControllerHelper');

module.exports = {
  /**
       * Share a poll to a group, where the poll does not exist previously.
       *
       * Tested on: 17-Aug-2019
       * {"module":"polls", "event":"shareToGroup", "messageid":89412, "data":{"pollid":1010, "groupid": 1004}}
       *
       * @param {number} userid       ID of the user
       * @param {number} pollid       ID of the poll
       * @param {number} groupid      ID of the group
       * @return {Status}
       *
       * @throws {errors.errorUserIsNotMember}
       *  When the user is not a member of the group
       * @throws {errors.errorUserDoesNotHavePoll}
       *  When the user does not have the poll
       * @throws {errors.errorPollAlreadyInGroup}
       *  When the group has the poll already
       * @throws {errors.errorPollIsDeleted}
       *  When the poll has been deleted
       */
  shareToGroup: async (userid, pollid, groupid) => {
    console.log('PollController.shareToGroup');
    assert.ok(check.number(userid),
        'argument \'userid\' must be a number');
    assert.ok(check.number(pollid),
        'argument \'pollid\' must be a number');
    assert.ok(check.number(groupid),
        'argument \'groupid\' must be a number');

    let dbsession = null;
    try {
      // Prepare data
      const data = {
        pollid: pollid,
        groupid: groupid,
        user_id: userid,
      };

      // Check user in group. If he is, then he can share
      const userIsMember = await GroupUsers.isMember(groupid, userid);
      if (!userIsMember) {
        throw new VError(errors.errorUserIsNotMember.message);
      }

      // Check user has the poll. If he has, then he can share
      const userHasPoll = await UserPolls.userHasPoll(userid, pollid);
      if (!userHasPoll) {
        throw new VError(errors.errorUserDoesNotHavePoll.message);
      }

      // Check group has the poll already. If it is, then no need to share again
      const pollInGroup = await GroupPolls.groupHasPoll(data);
      if (pollInGroup) {
        throw new VError(errors.errorPollAlreadyInGroup.message);
      }

      // Check if poll is deleted
      const isDeleted = await PollData.isDeleted(data);
      if (isDeleted) {
        throw new VError(errors.errorPollIsDeleted.message);
      }

      // Start transaction
      dbsession = await dbTransactions.start();

      // Share to the group
      await GroupPolls.shareToGroup(data);
      // We need to commit the transaction here.
      //  so that the currently added user will also get the notification.
      await dbTransactions.commit(dbsession);

      // Inform group users about this new poll
      ControllerHelper.informNewPollInGroup(data.groupid, data.pollid);

      const replyData = {
        status: success.successPollShared,
      };
      return replyData;
    } catch (err) {
      await dbTransactions.abort(dbsession);
      errors.wrapError(err);
    }
  },

  /**
         * To get the vote information of the given list of users
         *  for the given poll.
         * Not sure this is useful.
         *
         * Tested on: Pending
         * {"module":"polls", "event":"getUsersVotesByPoll", "messageid":1258, "data":{"user_ids":[2002], "pollid":1007}}
         *
         * @param {number} userid       ID of the user
         * @param {number} pollid       ID of the poll
         * @param {number[]} userids    IDs of the users whose vote info is needed
         * @return {PollVoteData[]}
         *
         * @throws {errors.errorUserDoesNotHavePoll}
         *  When the request user does not have the poll
         */
  getUsersVotesByPoll: async (userid, pollid, userids) => {
    console.log('PollController.getUsersVotesByPoll');
    assert.ok(check.number(userid),
        'argument \'userid\' must be a number');
    assert.ok(check.number(pollid),
        'argument \'pollid\' must be a number');
    assert.ok(check.array.of.number(userids),
        'argument \'userids\' must be number[]');

    try {
      // Check user has poll. If he has, he can get the vote details.
      const userHasPoll = await UserPolls.userHasPoll(userid, pollid);
      if (!userHasPoll) {
        throw new VError(errors.errorUserDoesNotHavePoll.message);
      }

      // Prepare data
      const data = {
        pollid: pollid,
        user_ids: userids,
      };
      return await PollVoteData.getUsersVotesByPoll(data);
    } catch (err) {
      errors.wrapError(err);
    }
  },

  /**
         * To synchronize the poll result of the given polls.
         * Not sure this is useful.
         *
         * Tested on: 17-Aug-2019
         * {"module":"polls", "event":"syncPollResults", "messageid":8658, "data":{"pollids":[1033, 1034], "lastsynchedtime":1562059405239}}
         *
         * @param {*} message
         * @return {PollResult[]}
         */
  syncPollResults: async (message) => {
    console.log('PollController.syncPollResults');
    if (!message.user_id ||
            !message.data ||
            !message.data.pollids ||
            !message.data.lastsynchedtime) {
      return await replyHelper.prepareError(message,
          null, errors.invalidData);
    }

    try {
      // Prepare data
      const data = {
        user_id: message.user_id,
        pollids: message.data.pollids,
        lastsynchedtime: message.data.lastsynchedtime,
      };

      return await PollResult.getUpdatedPollResults(data);
    } catch (err) {
      console.log(err);
      return await replyHelper.prepareError(message,
          errors.internalError);
    }
  },

  /**
         * To get the votes the user casted before.
         *
         * Tested on: Pending
         * {"module":"polls", "event":"getMyVotes", "messageid":15156}
         *
         * @param {number} userid   ID of the user
         * @return {PollVoteData[]}
         */
  getMyVotes: async (userid) => {
    console.log('PollController.getMyVotes');
    assert.ok(check.number(userid),
        'argument \'userid\' must be a number');

    try {
      return await PollVoteData.getMyVotes(userid);
    } catch (err) {
      errors.wrapError(err);
    }
  },
};
