const VError = require('verror');

const errors = require('../helpers/errorstousers');

const PollController = require('../controllers/PollController');

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
        reply = await PollController.delete(message.user_id,
            message.data.pollid);
        break;
      case 'vote':
        reply = await PollController.vote(message.user_id,
            message.data.pollid,
            message.data.optionindex,
            message.data.secretvote);
        break;
      case 'shareToGroup':
        reply = await PollController.shareToGroup(message.user_id,
            message.data.pollid,
            message.data.groupid);
        break;
      case 'getMyPollsInfo':
        reply = await PollController.getMyPollsInfo(message.user_id);
        break;
      case 'getInfo':
        reply = await PollController.getInfo(message.user_id,
            message.data.pollids);
        break;
      case 'getUsersVotesByPoll':
        reply = await PollController.getUsersVotesByPoll(message.user_id,
            message.data.pollid,
            message.data.user_ids);
        break;
      case 'syncPollResults':
        reply = await PollController.syncPollResults(message);
        break;
      case 'subscribeToPollResult':
        reply = await PollController.subscribeToPollResult(message.user_id,
            message.data.pollid);
        break;
      case 'unSubscribeToPollResult':
        reply = await PollController.unSubscribeToPollResult(message.user_id,
            message.data.pollid);
        break;
      case 'getMyVotes':
        reply = await PollController.getMyVotes(message.user_id);
        break;
      default:
        throw new VError(errors.unknownEvent.message);
    }
    return reply;
  },
};
