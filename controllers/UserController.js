var Users = require('../db/users');

var errors = require('../helpers/errorstousers');
var success = require('../helpers/successtousers');
var replyHelper = require('../helpers/replyhelper');
let GroupUsers = require('../db/groupusers');

module.exports = {
    getUsersByPhoneNumbers: async (req, res) => {
        console.log('UserController.getUsersByPhoneNumbers');
        let phoneNumbers = req.body.phoneNumbers;

        let users = await Users.getUsersByPhoneNumbers(phoneNumbers);
        var user_ids = [];
        users.forEach(oneUser => {
            user_ids.push(oneUser.user_id);
        });

        let userinfos = await Users.getUserInfoByUserIds(user_ids);
        res.status(200).send({ userslist: userinfos });
    },

    //Tested on: 18-06-2019
    //{"module":"users", "event":"getUsersFromPhoneNumbers", "messageid":3432, "phoneNumbers":["+919884386484"]}
    getUsersFromPhoneNumbers: async (message) => {
        console.log('UserController.getUsersFromPhoneNumbers');
        try {
            let users = await Users.getUsersByPhoneNumbers(message.phoneNumbers);
            var user_ids = [];
            users.forEach(oneUser => {
                user_ids.push(oneUser.user_id);
            });

            let userinfos = await Users.getUserInfoByUserIds(user_ids);
            return await replyHelper.prepareSuccess(message, null, userinfos);
        } catch (err) {
            return await replyHelper.prepareError(message, null, errors.unknownError);
        }
    },

    //Tested on: 20-06-2019
    //{"module":"users", "event":"getGroups", "messageid":3432}
    getGroups: async (message) => {
        console.log('UserController.getGroups');
        try {
            let groups = await GroupUsers.getGroupsOfUser(message.user_id);
            return await replyHelper.prepareSuccess(message, null, groups);
        } catch (err) {
            return await replyHelper.prepareError(message, null, errors.unknownError);
        }
    },
}