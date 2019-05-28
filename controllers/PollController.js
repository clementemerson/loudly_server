const uuidv4 = require('uuid/v4');
var Polls = require('../db/polls');
let Groups = require('../db/groups');
var dbTransactions = require('../db/session');

let connections = require('./websockets/connections');

var errors = require('../helpers/errorstousers');
var success = require('../helpers/successtousers');

module.exports = {
    create: async (message) => {
        console.log('PollController.create');
        try {
            dbsession = await dbTransactions.startSession();
            var data = {};

            data.id = uuidv4();
            data.title = message.data.title;
            data.issecret = message.data.issecret;
            data.canbeshared = message.data.canbeshared;
            data.options = message.data.options;
            data.createdby = message.user_id;

            await Polls.create(data);
            await dbTransactions.commitTransaction(dbsession);

            return success.successPollCreated;
        } catch (err) {
            await dbTransactions.abortTransaction(dbsession);
            return errors.unknownError;
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

            let poll = Polls.getPollInfo(data);
            if (poll) {

                let updatePollResult = Polls.updatePollResult(data);
                let updatePollVoterList = Polls.updatePollVoterList(data);
                var updatePollPublicVotes;
                if (poll.issecret != true && data.secretvote != true) {
                    updatePollPublicVotes = Polls.saveVote(data);
                } else {
                    data.user_id = 'secret_voter';
                }

                let resUpdatePollResult = await updatePollResult;
                await updatePollVoterList;
                if (updatePollPublicVotes) {
                    await updatePollPublicVotes;
                }

                await dbTransactions.commitTransaction(dbsession);

                let voters = await Polls.getVotersList(data);
                connections.inform(voters, data);
            } else {
                await dbTransactions.abortTransaction(dbsession);
                return errors.errorPollNotAvailable;
            }
            return success.successVoted;
        } catch (err) {
            await dbTransactions.abortTransaction(dbsession);
            return errors.unknownError;
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

            let pollInGroup = await Polls.isGroupHasPoll(data);
            if (!pollInGroup) {
                await Polls.shareToGroup(data);
                await dbTransactions.commitTransaction(dbsession);

                //TODO: send notification to all online users of the group (async)
                const groups = {
                    groupids: [data.groupid]
                };

                let groupUsers = await Groups.getUsers(groups);
                connections.inform(groupUsers, data);
                return success.successPollShared;
            } else {
                await dbTransactions.abortTransaction(dbsession);
                return errors.errorPollAlreadyInGroup;
            }
        } catch (err) {
            await dbTransactions.abortTransaction(dbsession);
            return errors.unknownError;
        }
    },
}