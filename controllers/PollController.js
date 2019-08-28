/*!
 * @author Clement <clementemerson@gmail.com>
 * date 07/21/2019
 * Methods to create, vote, share a poll. 
 */
/**
 * @copyright  Loudly 2019 
 *  
 */
var dbTransactions = require('../db/session');

let PollData = require('../db/polldata');
let PollVoteData = require('../db/pollvotedata');
let PollVoteRegister = require('../db/pollvoteregister');
let PollResult = require('../db/pollresult');
let GroupPolls = require('../db/grouppolls');
let UserPolls = require('../db/userpolls');
let GroupUsers = require('../db/groupusers');

let connections = require('../websockets/connections');

var errors = require('../helpers/errorstousers');
var success = require('../helpers/successtousers');
var replyHelper = require('../helpers/replyhelper');
var sequenceCounter = require('../db/sequencecounter');

let ControllerHelper = require('./ControllerHelper');

const redClient = require('../redis/redclient');
const keyPrefix = require('../redis/key_prefix');
const redHelper = require('../redis/redhelper');

module.exports = {

    /**
     * To create a poll.
     * 
     * Tested on: 17-Aug-2019
     * {"module":"polls", "event":"create", "messageid":3435, "data":{"title":"Poll title sample", "resultispublic": false, "canbeshared": true, "options":[{"index":0, "desc":"option1"},{"index":1,"desc":"option2"}]}}
     *
     * @param {*} message
     * @returns
     */
    create: async (message) => {
        console.log('PollController.create');
        if (!message.user_id || !message.data || !message.data.title || (message.data.resultispublic === undefined)
            || (message.data.canbeshared === undefined) || !message.data.options)
            return await replyHelper.prepareError(message, null, errors.invalidData);
        try {
            //Start transaction
            dbsession = await dbTransactions.startSession();

            //Prepare create poll
            var pollid = await sequenceCounter.getNextSequenceValue('poll');
            let data = {
                pollid: pollid,
                title: message.data.title,
                resultispublic: message.data.resultispublic,
                canbeshared: message.data.canbeshared,
                options: message.data.options,
                createdby: message.user_id,
                time: new Date()
            };
            //Create the poll
            await PollData.create(data);
            await PollResult.create(data);

            //Create an entry in userpolls table
            let shareWithUser = {
                pollid: pollid,
                user_id: message.user_id,
                sharedby: message.user_id
            }
            await UserPolls.shareWithUser(shareWithUser);
            await dbTransactions.commitTransaction(dbsession);

            let replyData = {
                pollid: pollid,
                createdAt: data.time.getTime(),
                status: success.successPollCreated
            }
            return await replyHelper.prepareSuccess(message, replyData);
        } catch (err) {
            console.log(err);
            return await replyHelper.prepareError(message, dbsession, errors.unknownError);
        }
    },

    //
    /**
     * To vote. And update group users, where the poll is present.
     * 
     * Tested on: Pending
     * {"module":"polls", "event":"vote", "messageid":8498, "data":{"pollid":1007, "optionindex": 0, "secretvote": false}}
     *
     * @param {*} message
     * @returns
     */
    vote: async (message) => {
        console.log('PollController.vote');

        //Validation checks
        if (!message.user_id || !message.data || !message.data.pollid
            || !message.data.optionindex || !message.data.secretvote)
            return await replyHelper.prepareError(message, null, errors.invalidData);

        var dbsession;
        try {
            //Start session
            dbsession = await dbTransactions.startSession();

            //Prepare voting data
            let data = {
                pollid: message.data.pollid,
                user_id: message.user_id,
                optionindex: message.data.optionindex,
                secretvote: message.data.secretvote
            }

            //Check if poll is available
            let poll = await PollData.getPollInfo(data);
            if (poll == null)
                return await replyHelper.prepareError(message, dbsession, errors.errorPollNotAvailable);

            //Check if the user has voted already
            let isUserVoted = await redClient.sismember(keyPrefix.pollVotedUsers + data.pollid, data.user_id);
            if (isUserVoted == true)
                return await replyHelper.prepareError(message, dbsession, errors.errorUserAlreadyVoted);

            //Update poll result
            let updatePollResult = PollResult.updatePollResult(data);
            //Update poll voter list
            let updatePollVoterList = PollVoteRegister.updatePollVoterList(data);
            var updatePollPublicVotes;
            if (data.secretvote != true) {
                //If vote is public, save who has voted
                updatePollPublicVotes = PollVoteData.saveVote(data);
            } else {
                data.user_id = 'secret_voter';
            }

            //Await for all operations.
            if (updatePollPublicVotes) {
                await Promise.all([
                    updatePollResult,
                    updatePollVoterList,
                    updatePollPublicVotes
                ]);
            } else {
                await Promise.all([
                    updatePollResult,
                    updatePollVoterList,
                ]);
            }

            if(secretvote == true) {
                await redHelper.updateSecretVoteResult(data.pollid, data.optionindex);
            } else {
                await redHelper.updateOpenVoteResult(data.pollid, data.optionindex);
            }
            //Adding to voted user list
            await redClient.sadd(keyPrefix.pollVotedUsers + data.pollid, data.user_id);
            //This list is used by fanout mechanism, to fanout the updated result to the subscribed users
            await redClient.sadd(keyPrefix.pollUpdates, data.pollid);
            await dbTransactions.commitTransaction(dbsession);

            //Send latest result to the user
            const pollResult = await redHelper.getPollResult(data.pollid);
            connections.inform(data.user_id, pollResult);

            //Todo: Send the vote information to the users of groups where the voted user is in.
            //User needs to send the groupids in which the poll is present.
            
            let replyData = {
                pollid: data.pollid,
                status: success.successVoted
            }
            return await replyHelper.prepareSuccess(message, replyData);
        } catch (err) {
            console.log(err);
            return await replyHelper.prepareError(message, dbsession, errors.unknownError);
        }
    },

    /**
     * Share a poll to a group, where the poll does not exist previously.
     *
     * Tested on: 17-Aug-2019
     * {"module":"polls", "event":"shareToGroup", "messageid":89412, "data":{"pollid":1010, "groupid": 1004}}
     * 
     * @param {*} message
     * @returns
     */
    shareToGroup: async (message) => {
        console.log('PollController.shareToGroup');
        if (!message.user_id || !message.data || !message.data.pollid
            || !message.data.groupid)
            return await replyHelper.prepareError(message, null, errors.invalidData);

        var dbsession;
        try {
            //Start transaction
            dbsession = await dbTransactions.startSession();

            //Prepare data
            let data = {
                pollid: message.data.pollid,
                groupid: message.data.groupid,
                user_id: message.user_id
            };

            //Check user has the poll. If he has, then he can share
            let userHasPoll = await UserPolls.userHasPoll(data);
            if (!userHasPoll) {
                return await replyHelper.prepareError(message, dbsession, errors.errorUserDoesNotHavePoll);
            }

            //Check user in group. If he is, then he can share
            let userIsMember = await GroupUsers.isMember(data);
            if (!userIsMember) {
                return await replyHelper.prepareError(message, dbsession, errors.errorUserIsNotMember);
            }

            //Check group has the poll already. If it is, then no need to share again
            let pollInGroup = await GroupPolls.groupHasPoll(data);
            if (pollInGroup) {
                return await replyHelper.prepareError(message, dbsession, errors.errorPollAlreadyInGroup);
            }

            //Check if poll is deleted
            let isDeleted = await PollData.isDeleted(data);
            if (isDeleted) {
                return await replyHelper.prepareError(message, dbsession, errors.errorPollIsDeleted);
            }

            //Share to the group
            await GroupPolls.shareToGroup(data);
            //We need to commit the transaction here. so that the currently added user will also get the notification.
            await dbTransactions.commitTransaction(dbsession);

            //Inform group users about this new poll
            ControllerHelper.informNewPollInGroup(data.groupid, data.pollid);

            let replyData = {
                status: success.successPollShared
            }
            return await replyHelper.prepareSuccess(message, replyData);
        } catch (err) {
            console.log(err);
            return await replyHelper.prepareError(message, dbsession, errors.unknownError);
        }
    },

    /**
     * To get all the polls in all the user's groups. (pollinfo)
     * May be called once when login.
     *
     * Tested on: 17-Aug-2019
     * {"module":"polls", "event":"getMyPollsInfo", "messageid":15156}
     * 
     * @param {*} message
     * @returns
     */
    getMyPollsInfo: async (message) => {
        console.log('PollController.getMyPollsInfo');
        if (!message.user_id)
            return await replyHelper.prepareError(message, null, errors.invalidData);

        try {
            let groups = await GroupUsers.getGroupsOfUser(message.user_id);

            let groupids = [];
            groups.forEach(groupUser => {
                groupids.push(groupUser.groupid);
            });

            let pollids = [];
            groupids.forEach(async (groupid) => {
                let pollsInGroup = await GroupPolls.getPolls(groupid);
                pollsInGroup.forEach(poll => {
                    if (pollids.indexOf(poll.pollid) == -1)
                        pollids.push(poll.pollid);
                });
            });

            let userPolls = await UserPolls.getPolls(message.user_id);
            userPolls.forEach(poll => {
                if (pollids.indexOf(poll.pollid) < 0)
                    pollids.push(poll.pollid);
            });

            let pollinfos = await PollData.getPollInfoByPollIds(pollids);
            console.log(pollinfos);
            return await replyHelper.prepareSuccess(message, pollinfos);
        } catch (err) {
            console.log(err);
            return await replyHelper.prepareError(message, null, errors.unknownError);
        }
    },

    /**
     * To get the pollinfo of the given pollids.
     * 
     * Tested on: 17-Aug-2019
     * {"module":"polls", "event":"getInfo", "messageid":89412, "data":{"pollids":[1002]}}
     *
     * @param {*} message
     * @returns
     */
    getInfo: async (message) => {
        console.log('PollController.getInfo');
        if (!message.user_id || !message.data || !message.data.pollids)
            return await replyHelper.prepareError(message, null, errors.invalidData);

        try {
            let pollinfos = await PollData.getPollInfoByPollIds(message.data.pollids);
            return await replyHelper.prepareSuccess(message, pollinfos);
        } catch (err) {
            console.log(err);
            return await replyHelper.prepareError(message, null, errors.unknownError);
        }
    },

    /**
     * To get the vote information of the given list of users for the given poll.
     * Not sure this is useful.
     * 
     * Tested on: Pending
     * {"module":"polls", "event":"getUsersVoteInfo", "messageid":1258, "data":{"user_ids":[2002], "pollid":1007}}
     *
     * @param {*} message
     * @returns
     */
    getUsersVoteInfo: async (message) => {
        console.log('PollController.getUsersVoteInfo');
        if (!message.user_id || !message.data || !message.data.pollid
            || !message.data.user_ids)
            return await replyHelper.prepareError(message, null, errors.invalidData);

        try {
            //Prepare data
            let data = {
                pollid: message.data.pollid,
                user_ids: message.data.user_ids
            }
            let usersVoteInfo = await PollVoteData.getUsersVoteInfo(data);
            return await replyHelper.prepareSuccess(message, usersVoteInfo);
        } catch (err) {
            console.log(err);
            return await replyHelper.prepareError(message, null, errors.unknownError);
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
     * @returns
     */
    syncPollResults: async (message) => {
        console.log('PollController.syncPollResults');
        if (!message.user_id || !message.data || !message.data.pollids
            || !message.data.lastsynchedtime)
            return await replyHelper.prepareError(message, null, errors.invalidData);

        try {
            //Prepare data
            let data = {
                user_id: message.user_id,
                pollids: message.data.pollids,
                lastsynchedtime: message.data.lastsynchedtime
            };

            let pollResults = await PollResult.getUpdatedPollResults(data);
            return await replyHelper.prepareSuccess(message, pollResults);
        } catch (err) {
            console.log(err);
            return await replyHelper.prepareError(message, null, errors.unknownError);
        }
    },

    /**
     * To subscribe to the pollresult.
     * Subscribed users will get notified by the fanout process.
     * The subscription will expire in a specific time, if the user 
     * does not unsubscribe it.
     * 
     * Tested on: 17-Aug-2019
     * {"module":"polls", "event":"subscribeToPollResult", "messageid":8658, "data":{"pollid":1023}}
     *
     * @param {*} message
     * @returns
     */
    subscribeToPollResult: async (message) => {
        console.log('PollController.subscribeToPollResult');
        if (!message.user_id || !message.data || !message.data.pollid)
            return await replyHelper.prepareError(message, null, errors.invalidData);

        try {
            //Prepare data
            let data = {
                user_id: message.user_id,
                pollid: message.data.pollid
            }

            //Check if the user has voted already
            let isUserVoted = await redClient.sismember(keyPrefix.pollVotedUsers + data.pollid, data.user_id);
            if (isUserVoted == false)
                return await replyHelper.prepareError(message, null, errors.errorUserNotVoted);

            //Adding subscription
            const score = (new Date()).getTime();
            redClient.zadd(keyPrefix.pollSubsription + data.pollid, data.user_id, score);

            //Send latest result to the user
            const pollResult = await redHelper.getPollResult(data.pollid);
            connections.inform(data.user_id, pollResult);

            let replyData = {
                status: success.userSubscribedToPollResult
            }
            return await replyHelper.prepareSuccess(message, replyData);
        } catch (err) {
            console.log(err);
            return await replyHelper.prepareError(message, null, errors.unknownError);
        }
    },

    /**
     * Unsubscribe to the poll result
     * 
     * Tested on: Pending
     * {"module":"polls", "event":"unSubscribeToPollResult", "messageid":8658, "data":{"pollid":1023}}
     *
     * @param {*} message
     * @returns
     */
    unSubscribeToPollResult: async (message) => {
        console.log('PollController.unSubscribeToPollResult');
        if (!message.user_id || !message.data || !message.data.pollid)
            return await replyHelper.prepareError(message, null, errors.invalidData);

        try {
            //Prepare data
            let data = {
                user_id: message.user_id,
                pollid: message.data.pollid
            }

            redClient.srem(keyPrefix.pollSubsription + data.pollid, data.user_id);

            let replyData = {
                status: success.userUnSubscribedToPollResult
            }
            return await replyHelper.prepareSuccess(message, replyData);
        } catch (err) {
            console.log(err);
            return await replyHelper.prepareError(message, null, errors.unknownError);
        }
    },

    /**
     * Delete a poll.
     * Todo: need to decide the conditions when a poll can be deleted.
     * 1. it is not shared to a group.
     * 2. no one has voted, like that...
     * 
     * Tested on: Pending
     *
     * @param {*} message
     * @returns
     */
    delete: async (message) => {
        console.log('PollController.delete');
        if (!message.user_id || !message.data || !message.data.pollid)
            return await replyHelper.prepareError(message, null, errors.invalidData);

        try {
            //Start transaction
            dbsession = await dbTransactions.startSession();

            //Prepare create poll
            let data = {
                pollid: message.data.pollid,
                user_id: message.user_id
            };

            //Creator can delete the poll
            let isCreator = await PollData.isCreator(data);
            if (!isCreator) {
                return await replyHelper.prepareError(message, dbsession, errors.errorUserNotCreatorOfPoll);
            }

            await PollData.delete(data);
            await dbTransactions.commitTransaction(dbsession);

            let replyData = {
                pollid: data.pollid,
                status: success.successPollDeleted
            }
            return await replyHelper.prepareSuccess(message, replyData);
        } catch (err) {
            console.log(err);
            return await replyHelper.prepareError(message, dbsession, errors.unknownError);
        }
    },
}