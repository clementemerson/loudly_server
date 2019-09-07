/* !
 * @author Clement <clementemerson@gmail.com>
 * date 07/21/2019
 * Methods to create, vote, share a poll.
 */
/**
 * @copyright  Loudly 2019
 *
 */

const VError = require('verror');
const assert = require('assert');
const check = require('check-types');

const errors = require('../helpers/errorstousers');
const success = require('../helpers/successtousers');
const replyHelper = require('../helpers/replyhelper');

const dbTransactions = require('../db/session');
const seqCounter = require('../db/sequencecounter');
const PollData = require('../db/polldata');
const PollVoteData = require('../db/pollvotedata');
const VoteRegister = require('../db/pollvoteregister');
const PollResult = require('../db/pollresult');
const GroupPolls = require('../db/grouppolls');
const UserPolls = require('../db/userpolls');
const GroupUsers = require('../db/groupusers');

const redClient = require('../redis/redclient');
const keyPrefix = require('../redis/key_prefix');
const redHelper = require('../redis/redhelper');

const connections = require('../websockets/connections');

module.exports = {

    /**
           * To create a poll.
           *
           * Tested on: 17-Aug-2019
           * {"module":"polls", "event":"create", "messageid":3435,  "data":{"title":"Poll title sample", "resultispublic": false, "canbeshared": true, "options":[{"index":0, "desc":"option1"}, {"index":1,"desc":"option2"}]}}
           *
           * @param {*} message
           * @return {Status}
           */
    create: async (message) => {
        console.log('PollController.create');
        if (!message.user_id ||
            !message.data ||
            !message.data.title ||
            (message.data.resultispublic === undefined) ||
            (message.data.canbeshared === undefined) ||
            !message.data.options) {
            return await replyHelper.prepareError(message,
                errors.invalidData);
        }
        try {
            // Start transaction
            dbsession = await dbTransactions.start();

            // Prepare create poll
            const pollid = await seqCounter.getNextValue('poll');
            const data = {
                pollid: pollid,
                title: message.data.title,
                resultispublic: message.data.resultispublic,
                canbeshared: message.data.canbeshared,
                options: message.data.options,
                createdby: message.user_id,
                time: new Date(),
            };
            // Create the poll
            await PollData.create(data);
            await PollResult.create(data);

            // Create an entry in userpolls table
            const shareWithUser = {
                pollid: pollid,
                user_id: message.user_id,
                sharedby: message.user_id,
            };
            await UserPolls.shareWithUser(shareWithUser);
            await dbTransactions.commit(dbsession);

            const replyData = {
                pollid: pollid,
                createdAt: data.time.getTime(),
                status: success.successPollCreated,
            };
            return replyData;
        } catch (err) {
            console.log(err);
            await dbTransactions.abort(dbsession);
            return await replyHelper.prepareError(message,
                errors.internalError);
        }
    },

    /**
           * To vote. And update group users, where the poll is present.
           *
           * Tested on: Pending
           * {"module":"polls", "event":"vote", "messageid":8498, "data":{"pollid":1007, "optionindex": 0, "secretvote": false}}
           *
           * @param {number} userid       ID of the user
           * @param {number} pollid       ID of the poll
           * @param {number} option       Option chosen by the user
           * @param {boolean} secretVote  Is the vote secret?
           * @return {Status}
           *
           * @throws {errors.errorPollNotAvailable}
           *  When the poll does not exist
           * @throws {errors.errorUserAlreadyVoted}
           *  When the user has voted already     *
           */
    vote: async (userid, pollid, option, secretVote) => {
        console.log('PollController.vote');
        assert.ok(check.number(userid),
            'argument \'userid\' must be a number');
        assert.ok(check.number(pollid),
            'argument \'pollid\' must be a number');
        assert.ok(check.number(option),
            'argument \'option\' must be a number');
        assert.ok(check.boolean(secretVote),
            'argument \'secretVote\' must be a boolean');

        let dbsession = null;
        try {
            // Prepare voting data
            const data = {
                pollid: pollid,
                user_id: userid,
                optionindex: option,
                secretvote: secretVote,
            };

            // Check if poll is available
            const poll = await PollData.getPollInfo(pollid);
            if (poll == null) {
                throw new VError(errors.errorPollNotAvailable.message);
            }

            // Check if the user has voted already
            const isUserVoted = await redClient.sismember(
                keyPrefix.pollVotedUsers + pollid, userid);
            if (isUserVoted == true) {
                throw new VError(errors.errorUserAlreadyVoted.message);
            }

            // Start session
            dbsession = await dbTransactions.start();

            // Update poll result
            const updatePollResult = PollResult.updatePollResult(data);
            // Update poll voter list
            const updatePollVoterList = VoteRegister.updatePollVoterList(data);
            //Save the vote
            const updatePollPublicVotes = PollVoteData.saveVote(data);

            // Await for all operations.
            await Promise.all([
                updatePollResult,
                updatePollVoterList,
                updatePollPublicVotes,
            ]);

            if (data.secretvote == true) {
                await redHelper.updateSecretVoteResult(data.pollid, data.optionindex);
            } else {
                await redHelper.updateOpenVoteResult(data.pollid, data.optionindex);
            }
            // Adding to voted user list
            await redClient.sadd(keyPrefix.pollVotedUsers + data.pollid,
                data.user_id);
            // This list is used by fanout mechanism,
            // to fanout the updated result to the subscribed users
            await redClient.sadd(keyPrefix.pollUpdates, data.pollid);
            await dbTransactions.commit(dbsession);

            // Send latest result to the user
            const pollResult = await redHelper.getPollResult(data.pollid);
            connections.inform(data.user_id, pollResult);

            // Todo: Send the vote information to the users of groups
            //  where the voted user is in.
            // User needs to send the groupids in which the poll is present.

            const replyData = {
                pollid: data.pollid,
                status: success.successVoted,
            };
            return replyData;
        } catch (err) {
            await dbTransactions.abort(dbsession);
            errors.wrapError(err);
        }
    },

    /**
           * To get all the polls in all the user's groups. (pollinfo)
           * May be called once when login.
           *
           * Tested on: 17-Aug-2019
           * {"module":"polls", "event":"getMyPollsInfo", "messageid":15156}
           *
           * @param {number} userid   ID of the user
           * @return {PollInfo[]}
           */
    getMyPollsInfo: async (userid) => {
        console.log('PollController.getMyPollsInfo');
        assert.ok(check.number(userid),
            'argument \'userid\' must be a number');

        try {
            const groups = await GroupUsers.getGroupsOfUser(userid);

            const groupids = [];
            groups.forEach((groupUser) => {
                groupids.push(groupUser.groupid);
            });

            const pollids = [];
            groupids.forEach(async (groupid) => {
                const pollsInGroup = await GroupPolls.getPolls(groupid);
                pollsInGroup.forEach((poll) => {
                    if (pollids.indexOf(poll.pollid) == -1) {
                        pollids.push(poll.pollid);
                    }
                });
            });

            const userPolls = await UserPolls.getPolls(userid);
            userPolls.forEach((poll) => {
                if (pollids.indexOf(poll.pollid) < 0) {
                    pollids.push(poll.pollid);
                }
            });

            return await PollData.getPollInfoByPollIds(pollids);
        } catch (err) {
            errors.wrapError(err);
        }
    },

    /**
           * To get the pollinfo of the given pollids.
           *
           * Tested on: 17-Aug-2019
           * {"module":"polls", "event":"getInfo", "messageid":89412, "data":{"pollids":[1002]}}
           *
           * @param {number} userid       ID of the user
           * @param {number[]} pollids    IDs of the polls
           * @return {PollInfo[]}
           */
    getInfo: async (userid, pollids) => {
        console.log('PollController.getInfo');
        assert.ok(check.number(userid),
            'argument \'userid\' must be a number');
        assert.ok(check.array.of.number(pollids),
            'argument \'pollids\' must be number[]');

        try {
            return await PollData.getPollInfoByPollIds(pollids);
        } catch (err) {
            errors.wrapError(err);
        }
    },

    /**
           * Delete a poll.
           * Todo: need to decide the conditions when a poll can be deleted.
           * 1. it is not shared to a group.
           * 2. no one has voted, like that...
           *
           * Tested on: Pending
           * {"module":"polls", "event":"delete", "messageid":8658, "data": {"pollid":1023}}
           *
           * @param {number} userid    ID of the user
           * @param {number} pollid    ID of the poll to delete
           * @return {Status}
           *
           * @throws {errors.errorUserNotCreatorOfPoll}
           *  When the user is not the creator of the poll
           * @throws {errors.errorPollSharedToGroup}
           *  When the poll is shared to atleast one group
           * @throws {errors.errorPollHasVotes}
           *  When someone other than the creatot voted for the poll
           */
    delete: async (userid, pollid) => {
        console.log('PollController.delete');
        assert.ok(check.number(userid),
            'argument \'userid\' must be a number');
        assert.ok(check.number(pollid),
            'argument \'pollid\' must be a number');

        let dbsession = null;
        try {
            // Creator can delete the poll
            const isCreator = await PollData.isCreator(userid, pollid);
            if (!isCreator) {
                throw new VError(errors.errorUserNotCreatorOfPoll.message);
            }

            // Todo: Is shared to a group
            const groupsOfPoll = await GroupPolls.getGroupsOfPoll(pollid);
            if (groupsOfPoll.length > 0) {
                throw new VError(errors.errorPollSharedToGroup.message);
            }

            // Start transaction
            dbsession = await dbTransactions.start();

            // Todo: no one has voted
            const votesOfPoll = await VoteRegister.getVotersList(pollid);
            if (votesOfPoll.length > 1) {
                // Someone else other than the creator has voted
            } else {
                await PollData.delete(data);
            }
            await dbTransactions.commit(dbsession);

            const replyData = {
                pollid: data.pollid,
                status: success.successPollDeleted,
            };
            return replyData;
        } catch (err) {
            await dbTransactions.abort(dbsession);
            errors.wrapError(err);
        }
    },
};
