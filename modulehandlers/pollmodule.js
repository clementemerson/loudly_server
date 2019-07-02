let PollController = require('../controllers/PollController');

module.exports = {
    handle: async (message) => {
        var reply;
        switch (message.event) {
            case 'create':
                reply = await PollController.create(message);
                break;
            case 'vote':
                reply = await PollController.vote(message);
                break;
            case 'shareToGroup':
                reply = await PollController.shareToGroup(message);
                break;
            case 'getInfo':
                reply = await PollController.getInfo(message);
                break;
            case 'getGroupUsersVoteInfo':
                reply = await PollController.getGroupUsersVoteInfo(message);
                break;
            case 'syncPollResults':
                reply = await PollController.syncPollResults(message);
                break;
            default:
                break;
        }
        return reply;
    }
}
