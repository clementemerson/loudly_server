const VError = require('verror');
const assert = require('assert');
const check = require('check-types');

const errors = require('../helpers/errorstousers');
const success = require('../helpers/successtousers');

const dbTransactions = require('../db/session');
const PollVoteData = require('../db/pollvotedata');
const GroupPolls = require('../db/grouppolls');
const UserPolls = require('../db/userpolls');
const GroupUsers = require('../db/groupusers');

const redClient = require('../redis/redclient');
const keyPrefix = require('../redis/key_prefix');

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
     * @param {number[]} groupids     IDs of the groups
     * @return {Status}
     *
     * @throws {errors.errorUserDoesNotHavePoll}
     *  When the user does not have the poll
     * @throws {errors.errorNoGroupsToShare}
     *  When the all group has the poll already or
     * the user is not a member of the groups
     */
    shareToGroup: async (userid, pollid, groupids) => {
        console.log('PollController.shareToGroup');
        assert.ok(check.number(userid),
            'argument \'userid\' must be a number');
        assert.ok(check.number(pollid),
            'argument \'pollid\' must be a number');
        assert.ok(check.array.of.number(groupids),
            'argument \'groupids\' must be a number[]');

        let dbsession = null;
        try {
            // Check user has the poll. If he has, then he can share
            const userHasPoll = await UserPolls.userHasPoll(userid, pollid);
            if (!userHasPoll) {
                throw new VError(errors.errorUserDoesNotHavePoll.message);
            }

            const groupsToRemove = [];
            for (const groupid of groupids) {
                // Check user in group. If he is, then he can share
                const userIsMember = await GroupUsers.isMember(groupid, userid);
                if (userIsMember == false) {
                    groupsToRemove.push(groupid);
                } else {
                    // Check group has the poll already. If it is, then no need to share again
                    const pollInGroup = await GroupPolls.groupHasPoll(pollid, groupid);
                    if (pollInGroup == true) {
                        groupsToRemove.push(groupid);
                    }
                }
            }

            if (groupids.length == groupsToRemove.length) {
                throw new VError(errors.errorNoGroupsToShare.message);
            }

            groupsToRemove.forEach((groupid) => {
                const nIndex = groupids.indexOf(groupid);
                // groupsToRemove is a subset of groupids
                // Hence nIndex >= 0 check is not needed
                groupids.splice(nIndex, 1);
            });

            // Start transaction
            dbsession = await dbTransactions.start();

            for (const groupid of groupids) {
                // Prepare data
                const data = {
                    pollid: pollid,
                    groupid: groupid,
                    user_id: userid,
                };
                // Share to the group
                await GroupPolls.shareToGroup(data);
            }

            // We need to commit the transaction here.
            //  so that the currently added user will also get the notification.
            await dbTransactions.commit(dbsession);

            // Inform group users about this new poll
            ControllerHelper.informNewPollInGroup(groupids, pollid);

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
            'argument \'userids\' must be a number[]');

        try {
            // Check user has poll. If he has, he can get the vote details.
            const userHasPoll = await UserPolls.userHasPoll(userid, pollid);
            if (!userHasPoll) {
                throw new VError(errors.errorUserDoesNotHavePoll.message);
            }

            // Check if the user has voted already
            const isUserVoted = await redClient.sismember(
                keyPrefix.pollVotedUsers + pollid,
                userid
            );
            if (isUserVoted == false) {
                throw new VError(errors.errorUserNotVoted.message);
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
