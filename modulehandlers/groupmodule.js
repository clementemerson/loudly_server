const VError = require('verror');

const errors = require('../helpers/errorstousers');

const GroupController = require('../controllers/GroupController');
const GroupUserController = require('../controllers/GroupUserController');

module.exports = {
  handle: async (message) => {
    if (!message ||
            !message.event) {
      throw new Error('Invalid Arguments');
    }

    let reply;
    switch (message.event) {
      case 'create':
        reply = await GroupController.create(message.user_id,
            message.data.name,
            message.data.desc);
        break;
      case 'changeTitle':
        reply = await GroupController.changeTitle(message.user_id,
            message.data.groupid,
            message.data.name);
        break;
      case 'changeDesc':
        reply = await GroupController.changeDesc(message.user_id,
            message.data.groupid,
            message.data.desc);
        break;
      case 'delete':
        reply = await GroupController.delete(message.user_id,
            message.data.groupid);
        break;
      case 'getMyGroupsInfo':
        reply = await GroupController.getMyGroupsInfo(message.user_id);
        break;
      case 'changeAvatar':
        // reply = await GroupController.changeAvatar(message);
        break;
      case 'getInfo':
        reply = await GroupController.getInfo(message.data.groupids);
        break;
      case 'getPolls':
        reply = await GroupController.getPolls(message.user_id,
            message.data.groupid);
        break;
      case 'addUser':
        reply = await GroupUserController.addUser(message.user_id,
            message.data.user_id,
            message.data.groupid,
            message.data.permission);
        break;
      case 'changeUserPermission':
        reply = await GroupUserController.changeUserPermission(message.user_id,
            message.data.user_id,
            message.data.groupid,
            message.data.permission);
        break;
      case 'removeUser':
        reply = await GroupUserController.removeUser(message.user_id,
            message.data.user_id,
            message.data.groupid);
        break;
      case 'getUsersOfGroup':
        reply = await GroupUserController.getUsersOfGroup(message.user_id,
            message.data.groupid);
        break;
      case 'getGroupUpdates':
        reply = await GroupController.getGroupUpdates(message);
        break;
      default:
        throw new VError(errors.unknownEvent.message);
    }
    return reply;
  },
};
