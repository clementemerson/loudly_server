let GroupController = require('../controllers/GroupController');

module.exports = {
    handle: async (message) => {
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
            case 'getDetails':
                reply = await GroupController.getDetails(message);
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
            case 'getPolls':
                reply = await GroupController.getPolls(message);
                break;
            default:
                break;
        }
        return reply;
    }
}
