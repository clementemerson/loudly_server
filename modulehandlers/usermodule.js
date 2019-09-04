const VError = require('verror');

const errors = require('../helpers/errorstousers');
const replyHelper = require('../helpers/replyhelper');

const UserController = require('../controllers/UserController');

module.exports = {
  handle: async (message) => {
    if (!message) {
      throw new Error('Invalid Arguments');
    }

    let reply;
    switch (message.event) {
      case 'getUsersFromPhoneNumbers':
        reply = await UserController.getUsersFromPhoneNumbers(
            message.user_id, message.data.phoneNumbers);
        break;
      case 'getGroups':
        reply = await UserController.getGroups(message.user_id);
        break;
      case 'getPolls':
        reply = await UserController.getPolls(message.user_id);
        break;
      case 'getInfo':
        reply = await UserController.getInfo(message.data.userids);
        break;
      case 'changeName':
        reply = await UserController.changeName(message.user_id,
            message.data.name);
        break;
      case 'changeStatusMsg':
        reply = await UserController.changeStatusMsg(message.user_id,
            message.data.statusmsg);
        break;
      default:
        throw new VError(errors.unknownEvent.message);
    }
    return await replyHelper.prepareSuccess(message, reply);
  },
};
