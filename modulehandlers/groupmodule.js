const GroupController = require('../controllers/GroupController');
const GroupUserController = require('../controllers/GroupUserController');

const errors = require('../helpers/errorstousers');
const replyHelper = require('../helpers/replyhelper');

module.exports = {
    handle: async (message) => {
        if (!message ||
            !message.event) {
            throw new Error('Invalid Arguments');
        }

        let reply;
        switch (message.event) {
            case 'create':
                reply = await GroupController.create(message);
                break;
            case 'changeTitle':
                reply = await GroupController.changeTitle(message);
                break;
            case 'changeDesc':
                reply = await GroupController.changeDesc(message);
                break;
            case 'delete':
                reply = await GroupController.delete(message);
                break;
            case 'getMyGroupsInfo':
                reply = await GroupController.getMyGroupsInfo(message);
                break;
            case 'changeAvatar':
                // reply = await GroupController.changeAvatar(message);
                break;
            case 'getInfo':
                reply = await GroupController.getInfo(message);
                break;
            case 'addUser':
                reply = await GroupUserController.addUser(message);
                break;
            case 'changeUserPermission':
                reply = await GroupUserController.changeUserPermission(message);
                break;
            case 'removeUser':
                reply = await GroupUserController.removeUser(message);
                break;
            case 'getUsersOfGroup':
                reply = await GroupUserController.getUsersOfGroup(message);
                break;
            case 'getPolls':
                reply = await GroupController.getPolls(message);
                break;
            case 'getGroupUpdates':
                reply = await GroupController.getGroupUpdates(message);
                break;
            default:
                reply = await replyHelper.prepareError(message,
                    null, errors.unknownEvent);
                break;
        }
        return reply;
    },
};
