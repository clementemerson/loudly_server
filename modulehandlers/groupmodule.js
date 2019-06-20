let GroupController = require('../controllers/GroupController');

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
            case 'changeAvatar':
                //reply = await GroupController.changeAvatar(message);
                break;
            case 'addUser':
                reply = await GroupController.addUser(message);
                break;
            case 'changeUserPermission':
                reply = await GroupController.changeUserPermission(message);
                break;
            case 'removeUser':
                reply = await GroupController.removeUser(message);
                break;
            case 'getInfo':
                reply = await GroupController.getInfo(message);
                break;
            case 'getUsersOfGroups':
                reply = await GroupController.getUsersOfGroups(message);
                break;
            case 'getPolls':
                reply = await GroupController.getPolls(message);
                break;
            default:
                break;
        }
        return reply;
    }
}
