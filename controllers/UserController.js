var Users = require('../db/users');
var dbTransactions = require('../db/session');

var errors = require('../helpers/errorstousers');
var success = require('../helpers/successtousers');
var replyHelper = require('../helpers/replyhelper');
let GroupUsers = require('../db/groupusers');
let UserPolls = require('../db/userpolls');

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
            let users = await Users.getUsersByPhoneNumbers(message.data.phoneNumbers);
            var user_ids = [];
            users.forEach(oneUser => {
                user_ids.push(oneUser.user_id);
            });

            let userinfos = await Users.getUserInfoByUserIds(user_ids);
            return await replyHelper.prepareSuccess(message, userinfos);
        } catch (err) {
            console.log(err);
            return await replyHelper.prepareError(message, null, errors.unknownError);
        }
    },

    //Tested on: 20-06-2019
    //{"module":"users", "event":"getGroups", "messageid":3432}
    getGroups: async (message) => {
        console.log('UserController.getGroups');
        try {
            let groups = await GroupUsers.getGroupsOfUser(message.user_id);
            return await replyHelper.prepareSuccess(message, groups);
        } catch (err) {
            console.log(err);
            return await replyHelper.prepareError(message, null, errors.unknownError);
        }
    },

    //Tested on: 21-06-2019
    //{"module":"users", "event":"getPolls", "messageid":9961}
    getPolls: async (message) => {
        console.log('UserController.getPolls');
        try {
            let polls = await UserPolls.getPolls(message.user_id);
            return await replyHelper.prepareSuccess(message, polls);
        } catch (err) {
            console.log(err);
            return await replyHelper.prepareError(message, null, errors.unknownError);
        }
    },

    //Tested on: 21-06-2019
    //{"module":"users", "event":"getInfo", "messageid":9961, "data":{"userids":[2000,2001]}}
    getInfo: async (message) => {
        console.log('UserController.getInfo');
        try {
            let userinfos = await Users.getUserInfoByUserIds(message.data.userids);
            return await replyHelper.prepareSuccess(message, userinfos);
        } catch (err) {
            console.log(err);
            return await replyHelper.prepareError(message, null, errors.unknownError);
        }
    },

    //Tested on: 03-07-2019
    //{"module":"users", "event":"changeName", "messageid":2154, "data":{"name":"Clement"}}
    changeName: async (message) => {
        console.log('UserController.changeName');
        var dbsession;
        try {
            //Start transaction
            dbsession = await dbTransactions.startSession();

            //Prepare data
            let data = {
                user_id: message.user_id,
                name: message.data.name
            }

            //Change the name
            await Users.changeName(data);
            await dbTransactions.commitTransaction(dbsession);

            let replyData = {
                status: success.userNameChanged
            }
            return await replyHelper.prepareSuccess(message, replyData);
        } catch (err) {
            console.log(err);
            return await replyHelper.prepareError(message, dbsession, errors.unknownError);
        }
    },

    //Tested on: 03-07-2019
    //{"module":"users", "event":"changeStatusMsg", "messageid":4641, "data":{"statusmsg":"some status"}}
    changeStatusMsg: async (message) => {
        console.log('UserController.changeStatusMsg');
        var dbsession;
        try {
            //Start transaction
            dbsession = await dbTransactions.startSession();

            //Prepare data
            let data = {
                user_id: message.user_id,
                statusmsg: message.data.statusmsg
            }

            //Change the name
            await Users.changeStatusMsg(data);
            await dbTransactions.commitTransaction(dbsession);

            let replyData = {
                status: success.userStatusChanged
            }
            return await replyHelper.prepareSuccess(message, replyData);
        } catch (err) {
            console.log(err);
            return await replyHelper.prepareError(message, dbsession, errors.unknownError);
        }
    },
}