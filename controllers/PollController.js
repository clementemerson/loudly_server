var dbTransactions = require('../db/session');

let PollData = require('../db/polldata');
let PollVoteData = require('../db/pollvotedata');
let PollVoteRegister = require('../db/pollvoteregister');
let GroupPolls = require('../db/grouppolls');
let UserPolls = require('../db/userpolls');
let GroupUsers = require('../db/groupusers');

let connections = require('../websockets/connections');

var errors = require('../helpers/errorstousers');
var success = require('../helpers/successtousers');
var replyHelper = require('../helpers/replyhelper');
let ControllerHelper = require('./ControllerHelper');
var sequenceCounter = require('../db/sequencecounter');

module.exports = {
    //Tested on: 19-06-2019
    //{"module":"polls", "event":"create", "messageid":3435, "data":{"title":"Poll title sample", "resultispublic": false, "canbeshared": true, "options":[{"title":"option1"},{"title":"option2"}]}}
    create: async (message) => {
        console.log('PollController.create');
        try {
            //Start transaction
            dbsession = await dbTransactions.startSession();

            //Prepare create poll
            var pollid = await sequenceCounter.getNextSequenceValue('poll');
            let data = {
                id: pollid,
                title: message.data.title,
                resultispublic: message.data.resultispublic,
                canbeshared: message.data.canbeshared,
                options: message.data.options,
                createdby: message.user_id
            };
            //Create the poll
            await PollData.create(data);

            //Create an entry in userpolls table
            let shareWithUser = {
                pollid: pollid,
                user_id: message.user_id,
                sharedby: message.user_id
            }
            await UserPolls.shareWithUser(shareWithUser);

            let replyData = {
                pollid: pollid,
                status: success.successPollCreated
            }
            return await replyHelper.prepareSuccess(message, dbsession, replyData);
        } catch (err) {
            return await replyHelper.prepareError(message, dbsession, errors.unknownError);
        }
    },

    vote: async (message) => {
        console.log('PollController.vote');
        var dbsession;
        try {
            dbsession = await dbTransactions.startSession();

            var data = {};
            data.pollid = message.data.pollid;
            data.user_id = message.user_id;
            data.optionindex = message.data.optionindex;
            data.secretvote = message.data.secretvote;

            let poll = PollData.getPollInfo(data);
            if (poll) {

                let updatePollResult = PollData.updatePollResult(data);
                let updatePollVoterList = PollVoteRegister.updatePollVoterList(data);
                var updatePollPublicVotes;
                if (data.secretvote != true) {
                    updatePollPublicVotes = PollVoteData.saveVote(data);
                } else {
                    data.user_id = 'secret_voter';
                }

                let resUpdatePollResult = await updatePollResult;
                await updatePollVoterList;
                if (updatePollPublicVotes) {
                    await updatePollPublicVotes;
                }

                await dbTransactions.commitTransaction(dbsession);

                let voters = await PollVoteRegister.getVotersList(data);
                connections.inform(voters, data);
            } else {
                return await replyHelper.prepareError(message, dbsession, errors.errorPollNotAvailable);
            }
            return success.successVoted;
        } catch (err) {
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

            //Share to the group
            await GroupPolls.shareToGroup(data);

            let groupUsers = GroupUsers.getUsers(message.data.groupid);
            for (const groupUser in groupUsers) {
                //Create an entry in userpolls table
                let shareWithUser = {
                    pollid: message.data.pollid,
                    user_id: groupUser.user_id,
                    sharedby: message.user_id
                }
                await UserPolls.shareWithUser(shareWithUser);
            }

            //Inform group users about this new poll
            ControllerHelper.informUsers(data.groupid, data);

            let replyData = {
                status: success.successPollShared
            }
            return await replyHelper.prepareSuccess(message, dbsession, replyData);
        } catch (err) {
            return await replyHelper.prepareError(message, dbsession, errors.unknownError);
        }
    },

    //Tested on: 21-06-2019
    //{"module":"polls", "event":"getInfo", "messageid":89412, "data":{"pollids":[1002]}}
    getInfo: async (message) => {
        console.log('PollController.getInfo');
        try {
            let pollinfos = await PollData.getPollInfoByPollIds(message.data.pollids);
            return await replyHelper.prepareSuccess(message, null, pollinfos);
        } catch (err) {
            return await replyHelper.prepareError(message, null, errors.unknownError);
        }
    },
}