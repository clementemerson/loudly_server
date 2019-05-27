var Users = require('../db/users');

var errors = require('../helpers/errorstousers');
var success = require('../helpers/successtousers');

module.exports = {
    getUsersByPhoneNumbers: async (req, res) => {
        console.log('UserController.getUsersByPhoneNumbers');
        let phoneNumbers = req.body.phoneNumbers;

        let users = await Users.getUsersByPhoneNumbers(phoneNumbers);
        var user_ids = [];
        users.forEach(oneUser => {
            user_ids.push(oneUser.user_id);
        });
        console.log(user_ids);

        let userinfos = await Users.getUserInfoByUserIds(user_ids);
        res.status(200).send({ userslist: userinfos });
    },
    getUsersFromPhoneNumbers: async (message) => {
        console.log('UserController.getUsersFromPhoneNumbers');
        try {
            let users = await Users.getUsersByPhoneNumbers(message.phoneNumbers);
            var user_ids = [];
            users.forEach(oneUser => {
                user_ids.push(oneUser.user_id);
            });

            let userinfos = await Users.getUserInfoByUserIds(user_ids);
            return success.sendData(userinfos);
        } catch (err) {
            return errors.unknownError;
        }
    },
    getGroups: async (message) => {
        console.log('UserController.getGroups');
        try {
            let groups = await Groups.getGroupsOfUser(message.user_id);
            return success.sendData(groups);
        } catch (err) {
            return errors.unknownError;
        }
    },
}