let UserController = require('../controllers/UserController');

const errors = require('../helpers/errorstousers');
const replyHelper = require('../helpers/replyhelper');

module.exports = {
    handle: async (message) => {
        if (!message)
            throw 'Invalid Arguments';

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
            case 'changeName':
                reply = await UserController.changeName(message);
                break;
            case 'changeStatusMsg':
                reply = await UserController.changeStatusMsg(message);
                break;
            default:
                reply = await replyHelper.prepareError(message, null, errors.unknownEvent);
                break;
        }
        return reply;
    }
}
