let UserController = require('../controllers/UserController');

module.exports = {
    handle: async (message) => {
        switch (message.event) {
            case 'getUsersFromPhoneNumbers':
                let userInfos = await UserController.getUsersFromPhoneNumbers(message.phoneNumbers);
                return userInfos;
                break;
            default:
                break;
        }
    }
}
