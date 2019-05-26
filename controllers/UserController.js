var success = require('../helpers/successtousers');
var Users = require('../db/users');

module.exports = {
    getUsersByPhoneNumbers: async (req, res) => {
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
        let users = await Users.getUsersByPhoneNumbers(message.phoneNumbers);
        var user_ids = [];
        users.forEach(oneUser => {
            user_ids.push(oneUser.user_id);
        });

        let userinfos = await Users.getUserInfoByUserIds(user_ids);
        return userinfos;
    },
    getGroups: async (message) => {
        let groups = await Groups.getGroupsOfUser(message.user_id);
        return groups;
    },
    getGroupsInfo: async (message) => {
        let groupInfos = await Groups.getInfo(message.groupids);
        return groupInfos;
    },
    getUsersOfGroups: async (message) => {
        let usersOfGroups = await Groups.getUsers(message.groupids);
        return usersOfGroups;
    },
}