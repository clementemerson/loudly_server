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
            case 'delete':
                reply = await PollController.delete(message);
                break;
            case 'shareToGroup':
                reply = await PollController.shareToGroup(message);
                break;
            default:
                break;
        }
        return reply;
    }
}
