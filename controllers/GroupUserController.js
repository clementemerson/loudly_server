var dbTransactions = require('../db/session');

let GroupUsers = require('../db/groupusers');
var Users = require('../db/users');

var errors = require('../helpers/errorstousers');
var success = require('../helpers/successtousers');
var replyHelper = require('../helpers/replyhelper');

var sequenceCounter = require('../db/sequencecounter');

let ControllerHelper = require('./ControllerHelper');

const redClient = require('../redis/redclient');
const keyPrefix = require('../redis/key_prefix');

module.exports = {

    //Tested on: 19-06-2019
    //{"module":"groups", "event":"addUser", "messageid":5818, "data":{"groupid": 3000, "user_id":2001, "permission":"USER"}}
    addUser: async (message) => {
        console.log('GroupController.addUser');
        if (!message.user_id || !message.data.user_id || !message.data.groupid || !message.data.permission)
            return await replyHelper.prepareError(message, null, errors.invalidData);

        try {
            //Start transaction
            dbsession = await dbTransactions.startSession();

            //Check the user is available. If he is, then he can be added to the group.
            const isUserExist = Users.isUserExist(message.data.user_id);
            if (isUserExist == false) {
                return await replyHelper.prepareError(message, dbsession, errors.errorUserNotExists);
            }

            //Check user is already a member
            let isMemberData = {
                groupid: message.data.groupid,
                user_id: message.data.user_id,
            };
            const isMember = await GroupUsers.isMember(isMemberData);
            if (isMember == true) {
                return await replyHelper.prepareError(message, dbsession, errors.errorUserIsMember);
            }

            //Check the user is an ADMIN. If he is, then he can add user.
            let isAdminData = {
                groupid: message.data.groupid,
                user_id: message.user_id,
            };
            const isAdmin = await GroupUsers.isAdmin(isAdminData);
            if (isAdmin == false) {
                return await replyHelper.prepareError(message, dbsession, errors.errorNotAnAdminUser);
            }

            //Now add the user
            let data = {
                groupid: message.data.groupid,
                user_id: message.data.user_id,
                addedby: message.user_id,
                permission: message.data.permission,
                operation: 'addUser'
            };
            await GroupUsers.addUser(data);
            await dbTransactions.commitTransaction(dbsession);

            //TODO: create entries in transaction tables
            //TODO: Notify all the online users of the group (async)
            ControllerHelper.informGroupUserUpdate(data.groupid, data);

            let replyData = {
                status: success.userAddedToGroup
            }
            return await replyHelper.prepareSuccess(message, replyData);
        } catch (err) {
            console.log(err);
            return await replyHelper.prepareError(message, dbsession, errors.unknownError);
        }
    },

    //Tested on: 20-06-2019
    //{"module":"groups", "event":"changeUserPermission", "messageid":1515, "data":{"groupid": 3000, "user_id":2001, "permission":"ADMIN"}}
    changeUserPermission: async (message) => {
        if (!message.user_id || !message.data.user_id || !message.data.groupid || !message.data.permission)
            return await replyHelper.prepareError(message, null, errors.invalidData);

        console.log('GroupController.changeUserPermission');
        try {
            //Start transaction
            dbsession = await dbTransactions.startSession();

            //Check user is already a member
            let isMemberData = {
                groupid: message.data.groupid,
                user_id: message.data.user_id,
            };
            const isMember = await GroupUsers.isMember(isMemberData);
            if (isMember == false) {
                return await replyHelper.prepareError(message, dbsession, errors.errorUserIsNotMember);
            }

            //Check the user is an ADMIN. If he is, then he can add user.
            let isAdminData = {
                groupid: message.data.groupid,
                user_id: message.user_id,
            };
            const isAdmin = await GroupUsers.isAdmin(isAdminData);
            if (isAdmin == false) {
                return await replyHelper.prepareError(message, dbsession, errors.errorNotAnAdminUser);
            }

            //Permission can be ADMIN or USER. Cant be CREATOR
            if (message.data.permission != 'ADMIN' && message.data.permission != 'USER') {
                return await replyHelper.prepareError(message, dbsession, errors.errorNotAllowedToSetThisPermission);
            }

            let data = {
                groupid: message.data.groupid,
                user_id: message.data.user_id,
                permission: message.data.permission,
                operation: 'changeUser'
            };
            await GroupUsers.changeUserPermission(data);
            await dbTransactions.commitTransaction(dbsession);

            //TODO: create entries in transaction tables
            //TODO: Notify all the online users of the group (async)
            ControllerHelper.informGroupUserUpdate(data.groupid, data);

            let replyData = {
                status: success.userPermissionChangedInGroup
            }
            return await replyHelper.prepareSuccess(message, replyData);
        } catch (err) {
            console.log(err);
            return await replyHelper.prepareError(message, dbsession, errors.unknownError);
        }
    },

    //Tested on: 20-06-2019
    //{"module":"groups", "event":"removeUser", "messageid":874984, "data":{"groupid": 3000, "user_id":2001}}-
    removeUser: async (message) => {
        if (!message.user_id || !message.data.user_id || !message.data.groupid)
            return await replyHelper.prepareError(message, null, errors.invalidData);

        console.log('GroupController.removeUser');
        try {
            //Start transaction
            dbsession = await dbTransactions.startSession();

            //Check user is already a member
            let isMemberData = {
                groupid: message.data.groupid,
                user_id: message.data.user_id,
            };
            const isMember = await GroupUsers.isMember(isMemberData);
            if (isMember == false) {
                return await replyHelper.prepareError(message, dbsession, errors.errorUserIsNotMember);
            }

            //Check the user is an ADMIN. If he is, then he can add user.
            let isAdminData = {
                groupid: message.data.groupid,
                user_id: message.user_id,
            };
            const isAdmin = await GroupUsers.isAdmin(isAdminData);
            if (isAdmin == false) {
                return await replyHelper.prepareError(message, dbsession, errors.errorNotAnAdminUser);
            }

            let data = {
                groupid: message.data.groupid,
                user_id: message.data.user_id,
                operation: 'removeUser'
            };
            await GroupUsers.removeUser(data);
            await dbTransactions.commitTransaction(dbsession);

            //TODO: create entries in transaction tables
            //TODO: Notify all the online users of the group (async)
            ControllerHelper.informGroupUserUpdate(data.groupid, data);
            //TODO: inform removed user

            let replyData = {
                status: success.userRemovedFromGroup
            }
            return await replyHelper.prepareSuccess(message, replyData);
        } catch (err) {
            console.log(err);
            return await replyHelper.prepareError(message, dbsession, errors.unknownError);
        }
    },

    //Tested on: 21-06-2019
    //{"module":"groups", "event":"getUsersOfGroups", "messageid":15185, "data":{"groupids":[1001, 1000]}}
    getUsersOfGroup: async (message) => {
        console.log('GroupController.getUsersOfGroups');
        if (!message.user_id || !message.data.groupid)
            return await replyHelper.prepareError(message, null, errors.invalidData);

        try {
            //Prepare data
            let data = {
                groupid: message.data.groupid,
                user_id: message.user_id
            }

            //Check user in group. If he is, then he can get the requested info
            let userIsMember = await GroupUsers.isMember(data);
            if (!userIsMember) {
                return await replyHelper.prepareError(message, null, errors.errorUserIsNotMember);
            }

            //Todo: use redis
            let usersOfGroups = await GroupUsers.getUsers(data.groupid);
            return await replyHelper.prepareSuccess(message, usersOfGroups);
        } catch (err) {
            console.log(err);
            return await replyHelper.prepareError(message, null, errors.unknownError);
        }
    },
}