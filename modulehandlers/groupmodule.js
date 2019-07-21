let GroupController = require('../controllers/GroupController');
let GroupUserController = require('../controllers/GroupUserController');

module.exports = {
    handle: async (message) => {
        console.log('groups module');
        var reply;
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
                //reply = await GroupController.changeAvatar(message);
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
                break;
        }
        return reply;
    }
}
