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

    //Tested on: 02-07-2019
    //{"module":"polls", "event":"create", "messageid":3435, "data":{"title":"Poll title sample", "resultispublic": false, "canbeshared": true, "options":[{"index":0, "desc":"option1"},{"index":1,"desc":"option2"}]}}
    create: async (message) => {
        console.log('PollController.create');
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
            await redHelper.updatePollInfo(data.pollid, data.title, data.resultispublic, data.canbeshared, data.options, data.createdby, data.time.getTime());

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

    //Tested on: 02-07-2019
    //{"module":"polls", "event":"vote", "messageid":8498, "data":{"pollid":1007, "optionindex": 0, "secretvote": false}}
    vote: async (message) => {
        console.log('PollController.vote');
        var dbsession;
        try {
            dbsession = await dbTransactions.startSession();

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
            let isUserVoted = await PollVoteRegister.isUserVoted(data);
            if (isUserVoted == true)
                return await replyHelper.prepareError(message, dbsession, errors.errorUserAlreadyVoted);

            let updatePollResult = PollResult.updatePollResult(data);
            let updatePollVoterList = PollVoteRegister.updatePollVoterList(data);
            var updatePollPublicVotes;
            if (data.secretvote != true) {
                updatePollPublicVotes = PollVoteData.saveVote(data);
            } else {
                data.user_id = 'secret_voter';
            }

            await updatePollResult;
            await updatePollVoterList;
            if (updatePollPublicVotes) {
                await updatePollPublicVotes;
            }
            await redClient.sadd(keyPrefix.pollVotedUsers + data.pollid, data.user_id);
            await dbTransactions.commitTransaction(dbsession);

            ControllerHelper.informPollUpdate(data.pollid);
            privateFunctions.updatePollResultToSubscribers(data.pollid);
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

    //Tested on: 21-06-2019
    //{"module":"polls", "event":"shareToGroup", "messageid":89412, "data":{"pollid":1010, "groupid": 1004}}
    shareToGroup: async (message) => {
        console.log('PollController.shareToGroup');

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
            await redClient.sadd(keyPrefix.pollInGroups + data.pollid, data.groupid);
            await redClient.sadd(keyPrefix.pollsOfGroup + data.groupid, data.pollid);
            //We need to commit the transaction here. so that the currently added user will also get the notification.
            await dbTransactions.commitTransaction(dbsession);

            //Inform group users about this new poll
            ControllerHelper.informUsers(message.data.groupid, data);
            ControllerHelper.informGroupUpdate(message.data.groupid);

            let replyData = {
                status: success.successPollShared
            }
            return await replyHelper.prepareSuccess(message, replyData);
        } catch (err) {
            console.log(err);
            return await replyHelper.prepareError(message, dbsession, errors.unknownError);
        }
    },

    getMyPollsInfo: async (message) => {
        console.log('PollController.getMyPollsInfo');
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
                    if (pollids.indexOf(poll.pollid) < 0)
                        pollids.push(poll.pollid);
                });
            });

            let userPolls = await UserPolls.getPolls(message.user_id);
            userPolls.forEach(poll => {
                if (pollids.indexOf(poll.pollid) < 0)
                    pollids.push(poll.pollid);
            });

            let pollinfos = await PollData.getPollInfoByPollIds(pollids);
            return await replyHelper.prepareSuccess(message, pollinfos);
        } catch (err) {
            console.log(err);
            return await replyHelper.prepareError(message, null, errors.unknownError);
        }
    },

    //Tested on: 21-06-2019
    //{"module":"polls", "event":"getInfo", "messageid":89412, "data":{"pollids":[1002]}}
    getInfo: async (message) => {
        console.log('PollController.getInfo');
        try {
            let pollinfos = await PollData.getPollInfoByPollIds(message.data.pollids);
            return await replyHelper.prepareSuccess(message, pollinfos);
        } catch (err) {
            console.log(err);
            return await replyHelper.prepareError(message, null, errors.unknownError);
        }
    },

    //Tested on: 03-07-2019
    //{"module":"polls", "event":"getUsersVoteInfo", "messageid":1258, "data":{"user_ids":[2002], "pollid":1007}}
    getUsersVoteInfo: async (message) => {
        console.log('PollController.getUsersVoteInfo');
        try {
            let usersVoteInfo = await PollVoteData.getUsersVoteInfo(message.data);
            return await replyHelper.prepareSuccess(message, usersVoteInfo);
        } catch (err) {
            console.log(err);
            return await replyHelper.prepareError(message, null, errors.unknownError);
        }
    },

    //{"module":"polls", "event":"syncPollResults", "messageid":8658, "data":{"lastsynchedtime":1562059405239}}
    syncPollResults: async (message) => {
        console.log('PollController.syncPollResults');
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

    //Tested on: 04-07-2019
    //{"module":"polls", "event":"subscribeToPollResult", "messageid":8658, "data":{"pollid":1023}}
    subscribeToPollResult: async (message) => {
        console.log('PollController.subscribeToPollResult');
        try {
            //Prepare data
            let data = {
                user_id: message.user_id,
                pollid: message.data.pollid
            }

            //Check if the user has voted already
            let isUserVoted = await PollVoteRegister.isUserVoted(data);
            if (isUserVoted == false)
                return await replyHelper.prepareError(message, null, errors.errorUserNotVoted);

            //Put an entry in pollresult subscription
            redClient.sadd(data.pollid, data.user_id);
            if (!connections.getPollResultSubscriptions()[data.pollid]) {
                connections.getPollResultSubscriptions()[data.pollid] = [];
            }
            connections.getPollResultSubscriptions()[data.pollid].push(data.user_id);

            //Put an entry in user subscription.
            //This will be used to clear pollresult subscription,
            // when the user connection terminates abruptly
            redClient.sadd(data.user_id, data.pollid);
            if (!connections.getUserPollSubscriptions()[data.user_id]) {
                connections.getUserPollSubscriptions()[data.user_id] = [];
            }
            connections.getUserPollSubscriptions()[data.user_id].push(data.pollid);

            let replyData = {
                status: success.userSubscribedToPollResult
            }
            return await replyHelper.prepareSuccess(message, replyData);
        } catch (err) {
            console.log(err);
            return await replyHelper.prepareError(message, null, errors.unknownError);
        }
    },

    //Tested on: 04-07-2019
    //{"module":"polls", "event":"unSubscribeToPollResult", "messageid":8658, "data":{"pollid":1023}}
    unSubscribeToPollResult: async (message) => {
        console.log('PollController.unSubscribeToPollResult');
        try {
            //Prepare data
            let data = {
                user_id: message.user_id,
                pollid: message.data.pollid
            }

            //Remove entry from pollresult subscription
            redClient.SREM(data.pollid, data.user_id);
            const subscribersArray = connections.getPollResultSubscriptions()[data.pollid];
            if (subscribersArray) {
                var index = subscribersArray.indexOf(data.user_id);
                if (index > -1)
                    subscribersArray.splice(index, 1);
            }

            //Remove entry from user subscription
            redClient.SREM(data.user_id, data.pollid);
            const pollArray = connections.getUserPollSubscriptions()[data.user_id];
            if (pollArray) {
                var index = pollArray.indexOf(data.pollid);
                if (index > -1)
                    pollArray.splice(index, 1);
            }

            let replyData = {
                status: success.userUnSubscribedToPollResult
            }
            return await replyHelper.prepareSuccess(message, replyData);
        } catch (err) {
            console.log(err);
            return await replyHelper.prepareError(message, null, errors.unknownError);
        }
    },

    delete: async (message) => {
        console.log('PollController.delete');
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

    getPollUpdates: async (message) => {
        console.log('GroupController.getGroupUpdates');
        try {
            //Prepare data
            let data = {
                user_id: message.user_id
            }

            let updatedPollResultIds = await redClient.smembers(keyPrefix.pollResultUpdate + data.user_id);
            let updatedResults = await redHelper.getPollResults(updatedPollResultIds);

            return await replyHelper.prepareSuccess(message, updatedResults);
        } catch (err) {
            console.log(err);
            return await replyHelper.prepareError(message, null, errors.unknownError);
        }
    },
}

privateFunctions = {
    updatePollResultToSubscribers: async (pollid) => {
        console.log('PollController.updatePollResultToSubscribers');
        try {
            let pollResults = await PollResult.getPollResult(pollid);
            let pollResult = pollResults[0];
            if (pollResult) {
                let pollResultSubscribers = connections.getPollResultSubscriptions()[pollid];
                if (pollResultSubscribers) {
                    pollResultSubscribers.forEach(user_id => {
                        connections.getConnections().get(user_id).send(JSON.stringify(pollResult));
                    });
                }
            }
        } catch (err) {
            console.log(err);
        }
    },
}