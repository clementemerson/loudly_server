const PollController = require('../controllers/PollController');

const errors = require('../helpers/errorstousers');
const replyHelper = require('../helpers/replyhelper');

module.exports = {
  handle: async (message) => {
    if (!message) {
      throw new Error('Invalid Arguments');
    }

    let reply;
    switch (message.event) {
      case 'create':
        reply = await PollController.create(message);
        break;
      case 'delete':
        reply = await PollController.delete(message);
        break;
      case 'vote':
        reply = await PollController.vote(message);
        break;
      case 'shareToGroup':
        reply = await PollController.shareToGroup(message);
        break;
      case 'getMyPollsInfo':
        reply = await PollController.getMyPollsInfo(message);
        break;
      case 'getInfo':
        reply = await PollController.getInfo(message);
        break;
      case 'getUsersVotesByPoll':
        reply = await PollController.getUsersVotesByPoll(message);
        break;
      case 'syncPollResults':
        reply = await PollController.syncPollResults(message);
        break;
      case 'subscribeToPollResult':
        reply = await PollController.subscribeToPollResult(message);
        break;
      case 'unSubscribeToPollResult':
        reply = await PollController.unSubscribeToPollResult(message);
        break;
      case 'getMyVotes':
        reply = await PollController.getMyVotes(message);
        break;
      default:
        reply = await replyHelper.prepareError(message,
            null, errors.unknownEvent);
        break;
    }
    return reply;
  },
};
