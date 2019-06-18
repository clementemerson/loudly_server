var dbTransactions = require('../db/session');

let PollData = require('../db/polldata');
let PollVoteData = require('../db/pollvotedata');
let PollVoteRegister = require('../db/pollvoteregister');

let GroupPolls = require('../db/grouppolls');
let GroupUsers = require('../db/groupusers');

let connections = require('../websockets/connections');

var errors = require('../helpers/errorstousers');
var success = require('../helpers/successtousers');
var replyHelper = require('../helpers/replyhelper');

var sequenceCounter = require('../db/sequencecounter');

module.exports = {
    //Tested on: 18-06-2019
    //{"module":"polls", "event":"create", "messageid":3435, "data":{"title":"Poll title sample", "issecret": false, "canbeshared": true, "options":[{"title":"option1"},{"title":"option2"}]}}
    create: async (message) => {
        console.log('PollController.create');
        try {
            dbsession = await dbTransactions.startSession();

            var pollid = await sequenceCounter.getNextSequenceValue('poll');
            let data = {
                id: pollid,
                title: message.data.title,
                issecret: message.data.issecret,
                canbeshared: message.data.canbeshared,
                options: message.data.options,
                createdby: message.user_id
            };
            await PollData.create(data);

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
                if (poll.issecret != true && data.secretvote != true) {
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

    shareToGroup: async (message) => {
        console.log('PollController.shareToGroup');

        var dbsession;
        try {
            dbsession = await dbTransactions.startSession();

            var data = {};
            data.pollid = message.data.pollid;
            data.groupid = message.data.groupid;
            data.sharedby = message.user_id;

            let pollInGroup = await GroupPolls.isGroupHasPoll(data);
            if (!pollInGroup) {
                await GroupPolls.shareToGroup(data);
                await dbTransactions.commitTransaction(dbsession);

                //TODO: send notification to all online users of the group (async)
                const groups = {
                    groupids: [data.groupid]
                };

                let groupUsers = await GroupUsers.getUsers(groups);
                connections.inform(groupUsers, data);
                return success.successPollShared;
            } else {
                return await replyHelper.prepareError(message, dbsession, errors.errorPollAlreadyInGroup);
            }
        } catch (err) {
            return await replyHelper.prepareError(message, dbsession, errors.unknownError);
        }
    },
}