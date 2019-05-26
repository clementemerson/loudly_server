const uuidv4 = require('uuid/v4');
var Polls = require('../db/polls');

module.exports = {
    create: async (message) => {
        console.log('PollController.create');
        //TODO: nothing
        var data = {};

        data.id = uuidv4();
        data.title = message.data.title;
        data.options = message.data.options;
        data.createdby = message.user_id;

        return await Polls.create(data);
    },

    vote: async (message) => {
        console.log('PollController.vote');
        //TODO: update pollresult and groupPollResult
        //TODO: create entries in transaction tables
        var data = {};

        data.pollid = message.data.pollid;
        data.user_id = message.user_id;
        data.optionindex = message.data.optionindex;

        return await Polls.vote(data);
    },

    shareToGroup: async (message) => {
        console.log('PollController.shareToGroup');
        //TODO: if the poll is already shared to the group then do not proceed
        //TODO: create entries in transaction tables
        var data = {};

        data.pollid = message.data.pollid;
        data.groupid = message.data.groupid;
        data.sharedby = message.user_id;

        return await Polls.shareToGroup(data);
    },
}