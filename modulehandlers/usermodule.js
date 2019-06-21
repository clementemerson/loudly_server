let UserController = require('../controllers/UserController');

module.exports = {
    handle: async (message) => {
        var reply;
        switch (message.event) {
            case 'getUsersFromPhoneNumbers':
                reply = await UserController.getUsersFromPhoneNumbers(message);
                break;
            case 'getGroups':
                reply = await UserController.getGroups(message);
                break;
            case 'getPolls':
                reply = await UserController.getPolls(message);
                break;
            case 'getInfo':
                reply = await UserController.getInfo(message);
                break;
            default:
                break;
        }
        return reply;
    }
}
