var Users = require('../db/users');
var dbTransactions = require('../db/session');

var errors = require('../helpers/errorstousers');
var success = require('../helpers/successtousers');
var replyHelper = require('../helpers/replyhelper');
let GroupUsers = require('../db/groupusers');
let UserPolls = require('../db/userpolls');

const redHelper = require('../redis/redhelper');

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

    //{"module":"users", "event":"getUsersFromPhoneNumbers", "messageid":3432, "phoneNumbers":["+919884386484"]}
    getUsersFromPhoneNumbers: async (message) => {
        console.log('UserController.getUsersFromPhoneNumbers');
        if (!message.user_id || !message.data || !message.data.phoneNumbers)
            return await replyHelper.prepareError(message, null, errors.invalidData);
            
        try {
            let users = await redHelper.getUserIdsByPhone(message.data.phoneNumbers);
            console.log(users);
            var user_ids = [];
            users.forEach(oneUser => {
                user_ids.push(oneUser.id);
            });

            let userinfos = await Users.getUserInfoByUserIds(user_ids);
            return await replyHelper.prepareSuccess(message, userinfos);
        } catch (err) {
            console.log(err);
            return await replyHelper.prepareError(message, null, errors.unknownError);
        }
    },

    //One time
    getGroups: async (message) => {
        console.log('UserController.getGroups');
        if (!message.user_id)
            return await replyHelper.prepareError(message, null, errors.invalidData);

        try {
            let groups = await GroupUsers.getGroupsOfUser(message.user_id);
            return await replyHelper.prepareSuccess(message, groups);
        } catch (err) {
            console.log(err);
            return await replyHelper.prepareError(message, null, errors.unknownError);
        }
    },

    //One time
    getPolls: async (message) => {
        console.log('UserController.getPolls');
        if (!message.user_id)
            return await replyHelper.prepareError(message, null, errors.invalidData);

        try {
            let polls = await UserPolls.getPolls(message.user_id);
            return await replyHelper.prepareSuccess(message, polls);
        } catch (err) {
            console.log(err);
            return await replyHelper.prepareError(message, null, errors.unknownError);
        }
    },

    //{"module":"users", "event":"getInfo", "messageid":9961, "data":{"userids":[2000,2001]}}
    getInfo: async (message) => {
        console.log('UserController.getInfo');
        if (!message.user_id || !message.data || !message.data.userids)
            return await replyHelper.prepareError(message, null, errors.invalidData);

        try {
            let userinfos = await Users.getUserInfoByUserIds(message.data.userids);
            return await replyHelper.prepareSuccess(message, userinfos);
        } catch (err) {
            console.log(err);
            return await replyHelper.prepareError(message, null, errors.unknownError);
        }
    },

    //{"module":"users", "event":"changeName", "messageid":2154, "data":{"name":"Clement"}}
    changeName: async (message) => {
        console.log('UserController.changeName');
        if (!message.user_id || !message.data || !message.data.name)
            return await replyHelper.prepareError(message, null, errors.invalidData);

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

    //{"module":"users", "event":"changeStatusMsg", "messageid":4641, "data":{"statusmsg":"some status"}}
    changeStatusMsg: async (message) => {
        console.log('UserController.changeStatusMsg');
        if (!message.user_id || !message.data || !message.data.statusmsg)
            return await replyHelper.prepareError(message, null, errors.invalidData);

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