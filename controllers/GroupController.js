var dbTransactions = require('../db/session');

let GroupUsers = require('../db/groupusers');
let GroupInfo = require('../db/groupinfo');
let GroupPolls = require('../db/grouppolls');

var errors = require('../helpers/errorstousers');
var success = require('../helpers/successtousers');
var replyHelper = require('../helpers/replyhelper');

var sequenceCounter = require('../db/sequencecounter');

module.exports = {
    //Tested on: 18-06-2019
    //{"module":"groups", "event":"create", "messageid":32352, "data":{"name":"group name", "desc":"some description about the group"}}
    create: async (message) => {
        console.log('GroupController.create');
        try {
            dbsession = await dbTransactions.startSession();

            var groupid = await sequenceCounter.getNextSequenceValue('group');

            let groupData = {
                id: groupid,
                name: message.data.name,
                desc: message.data.desc,
                createdby: message.user_id
            }
            await GroupInfo.create(groupData);

            //Adding user with CREATOR privileges
            let userBeCreator = {
                groupid: groupid,
                user_id: message.user_id,
                addedby: message.user_id,
                permission: 'CREATOR'
            }
            await GroupUsers.addUser(userBeCreator);

            //Adding user with ADMIN privileges
            let userBeAdmin = {
                groupid: groupid,
                user_id: message.user_id,
                addedby: message.user_id,
                permission: 'ADMIN'
            }
            await GroupUsers.addUser(userBeAdmin);

            let replyData = {
                groupid: groupid,
                status: success.groupCreated
            }
            return await replyHelper.prepareSuccess(message, dbsession, replyData);
        } catch (err) {
            return await replyHelper.prepareError(message, dbsession, errors.unknownError);
        }
    },

    changeTitle: async (message) => {
        console.log('GroupController.changeTitle');
        try {
            dbsession = await dbTransactions.startSession();

            let data = {
                id: message.data.id,
                name: message.data.name,
                changedby: message.user_id
            };
            await GroupInfo.changeTitle(data);
            //TODO: create entries in transaction tables
            //TODO: Notify all the online users of the group (async)

            let replyData = {
                groupid: groupid,
                status: success.groupTitleChanged
            }
            return await replyHelper.prepareSuccess(message, dbsession, replyData);
        } catch (err) {
            return await replyHelper.prepareError(message, dbsession, errors.unknownError);
        }
    },

    changeDesc: async (message) => {
        console.log('GroupController.changeDesc');
        try {
            dbsession = await dbTransactions.startSession();
            var data = {};

            data.id = message.data.id;
            data.desc = message.data.desc;
            data.changedby = message.user_id;

            await GroupInfo.changeDesc(data);
            //TODO: create entries in transaction tables
            //TODO: Notify all the online users of the group (async)

            await dbTransactions.commitTransaction(dbsession);
            return success.groupDescChanged;
        } catch (err) {
            return await replyHelper.prepareError(message, dbsession, errors.unknownError);
        }
    },

    delete: async (message) => {
        console.log('GroupController.delete');
        try {
            dbsession = await dbTransactions.startSession();
            var data = {};

            data.id = message.data.id;
            data.deleteby = message.user_id;

            await GroupInfo.delete(data);  //mark as deleted
            //TODO: delete usersofgroup
            //TODO: create entries in transaction tables
            //TODO: Notify all the online users of the group (async) ... 
            // ... prior to delete all users take the list and then delete

            await dbTransactions.commitTransaction(dbsession);
            return success.groupDeleted;
        } catch (err) {
            return await replyHelper.prepareError(message, dbsession, errors.unknownError);
        }
    },

    //Tested on: 18-06-2019
    //{"module":"groups", "event":"getGroupsInfo", "messageid":8971, "data":{"groupids":[1001, 1000]}}
    getGroupsInfo: async (message) => {
        console.log('GroupController.getGroupsInfo');
        try {
            let data = {
                groupids: message.data.groupids
            }
            let groupsInfo = await GroupInfo.getGroupsInfo(data);
            return await replyHelper.prepareSuccess(message, null, groupsInfo);
        } catch (err) {
            return await replyHelper.prepareError(message, null, errors.unknownError);
        }
    },

    addUser: async (message) => {
        console.log('GroupController.addUser');
        try {
            dbsession = await dbTransactions.startSession();
            var data = {};

            data.groupid = message.data.groupid;
            data.user_id = message.data.user_id;
            data.addedby = message.user_id;
            data.permission = message.data.permission;

            const isAdmin = await GroupUsers.isAdmin(data);
            if (isAdmin == true) {
                await GroupUsers.addUser(data);
                //TODO: create entries in transaction tables
                //TODO: Notify all the online users of the group (async)

                await dbTransactions.commitTransaction(dbsession);
                return success.userAddedToGroup;
            } else {
                return await replyHelper.prepareError(message, dbsession, errors.errorNotAnAdminUser);
            }
        } catch (err) {
            return await replyHelper.prepareError(message, dbsession, errors.unknownError);
        }
    },

    changeUserPermission: async (message) => {
        console.log('GroupController.changeUserPermission');
        try {
            dbsession = await dbTransactions.startSession();
            var data = {};

            data.groupid = message.data.groupid;
            data.user_id = message.data.user_id;
            data.permission = message.data.permission;

            const isAdmin = await GroupUsers.isAdmin(data);
            if (isAdmin == true) {
                await GroupUsers.changeUserPermission(data);
                //TODO: create entries in transaction tables
                //TODO: Notify all the online users of the group (async)

                await dbTransactions.commitTransaction(dbsession);
                return success.userPermissionChangedInGroup;
            } else {
                return await replyHelper.prepareError(message, dbsession, errors.errorNotAnAdminUser);
            }
        } catch (err) {
            return await replyHelper.prepareError(message, dbsession, errors.unknownError);
        }
    },

    removeUser: async (message) => {
        console.log('GroupController.removeUser');
        try {
            dbsession = await dbTransactions.startSession();
            var data = {};

            data.groupid = message.data.groupid;
            data.user_id = message.data.user_id;

            const isAdmin = await GroupUsers.isAdmin(data);
            if (isAdmin == true) {
                await GroupUsers.removeUser(data);
                //TODO: create entries in transaction tables
                //TODO: Notify all the online users of the group (async)

                await dbTransactions.commitTransaction(dbsession);
                return success.userRemovedFromGroup;
            } else {
                return await replyHelper.prepareError(message, dbsession, errors.errorNotAnAdminUser);
            }
        } catch (err) {
            return await replyHelper.prepareError(message, dbsession, errors.unknownError);
        }
    },

    //Tested on: 18-06-2019
    //{"module":"groups", "event":"getUsersOfGroups", "messageid":15185, "data":{"groupids":[1001, 1000]}}
    getUsersOfGroups: async (message) => {
        console.log('GroupController.getUsersOfGroups');
        try {
            let data = {
                groupids: message.data.groupids
            };
            let usersOfGroups = await GroupUsers.getUsers(data);
            return await replyHelper.prepareSuccess(message, null, usersOfGroups);
        } catch (err) {
            return await replyHelper.prepareError(message, null, errors.unknownError);
        }
    },

    getPolls: async (message) => {
        console.log('GroupController.getPolls');
        try {
            let data = {
                groupid: message.data.groupid
            }
            let pollsInGroup = await GroupPolls.getPolls(data);
            return await replyHelper.prepareSuccess(message, dbsession, pollsInGroup);
        } catch (err) {
            return await replyHelper.prepareError(message, dbsession, errors.unknownError);
        }
    }
}