const uuidv4 = require('uuid/v4');
var Polls = require('../db/polls');
var dbTransactions = require('../db/session');

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

            let poll = Polls.getPollInfo(data);

            let updatePollResult = Polls.updatePollResult(data);
            let updatePollVoterList = Polls.updatePollVoterList(data);
            var updatePollPublicVotes;
            if (poll.issecret != true) {
                updatePollPublicVotes = Polls.saveVote(data);
            }

            let resUpdatePollResult = await updatePollResult;
            await updatePollVoterList;
            if (updatePollPublicVotes) {
                await updatePollPublicVotes;
            }

            await dbTransactions.commitTransaction(dbsession);

            //TODO: send notification to all online users of the poll (async)
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