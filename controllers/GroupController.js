const uuidv4 = require('uuid/v4');
let Groups = require('../db/groups');
var dbTransactions = require('../db/session');

var errors = require('../helpers/errorstousers');
var success = require('../helpers/successtousers');

module.exports = {
    create: async (message) => {
        console.log('GroupController.create');
        try {
            var data = {};

            data.id = uuidv4();
            data.name = message.data.name;
            data.desc = message.data.desc;
            data.createdby = message.createdby;

            await Groups.create(data);
            return success.groupCreated;
        } catch (err) {
            return errors.unknownError;
        }
    },

    changeTitle: async (message) => {
        console.log('GroupController.changeTitle');
        try {
            dbsession = await dbTransactions.startSession();
            var data = {};

            data.id = message.data.id;
            data.name = message.data.name;
            data.changedby = message.user_id;

            await Groups.changeTitle(data);
            //TODO: create entries in transaction tables
            //TODO: Notify all the online users of the group (async)

            await dbTransactions.commitTransaction(dbsession);
            return success.groupTitleChanged;
        } catch (err) {
            await dbTransactions.abortTransaction(dbsession);
            return errors.unknownError;
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

            await Groups.changeDesc(data);
            //TODO: create entries in transaction tables
            //TODO: Notify all the online users of the group (async)

            await dbTransactions.commitTransaction(dbsession);
            return success.groupDescChanged;
        } catch (err) {
            await dbTransactions.abortTransaction(dbsession);
            return errors.unknownError;
        }
    },

    delete: async (message) => {
        console.log('GroupController.delete');
        try {
            dbsession = await dbTransactions.startSession();
            var data = {};

            data.id = message.data.id;
            data.deleteby = message.user_id;

            await Groups.delete(data);
            //TODO: delete usersofgroup
            //TODO: create entries in transaction tables
            //TODO: Notify all the online users of the group (async) ... 
            // ... prior to delete all users take the list and then delete

            await dbTransactions.commitTransaction(dbsession);
            return success.groupDeleted;
        } catch (err) {
            await dbTransactions.abortTransaction(dbsession);
            return errors.unknownError;
        }
    },

    getGroupsInfo: async (message) => {
        console.log('GroupController.getGroupsInfo');
        try {
            var data = {};

            data.groupids = message.data.groupids;

            let groupsInfo = await Groups.getGroupsInfo(data);
            return success.sendData(groupsInfo);
        } catch (err) {
            return errors.unknownError;
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

            //TODO: check for ADMIN permission
            await Groups.addUser(data);
            //TODO: create entries in transaction tables
            //TODO: Notify all the online users of the group (async)

            await dbTransactions.commitTransaction(dbsession);
            return success.userAddedToGroup;
        } catch (err) {
            await dbTransactions.abortTransaction(dbsession);
            return errors.unknownError;
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

            //TODO: check for ADMIN permission
            await Groups.changeUserPermission(data);
            //TODO: create entries in transaction tables
            //TODO: Notify all the online users of the group (async)

            await dbTransactions.commitTransaction(dbsession);
            return success.userPermissionChangedInGroup;
        } catch (err) {
            await dbTransactions.abortTransaction(dbsession);
            return errors.unknownError;
        }
    },

    removeUser: async (message) => {
        console.log('GroupController.removeUser');
        try {
            dbsession = await dbTransactions.startSession();
            var data = {};

            data.groupid = message.data.groupid;
            data.user_id = message.data.user_id;

            //TODO: check for ADMIN permission
            await Groups.removeUser(data);
            //TODO: create entries in transaction tables
            //TODO: Notify all the online users of the group (async)

            await dbTransactions.commitTransaction(dbsession);
            return success.userRemovedFromGroup;
        } catch (err) {
            await dbTransactions.abortTransaction(dbsession);
            return errors.unknownError;
        }
    },

    getUsersOfGroups: async (message) => {
        console.log('GroupController.getUsersOfGroups');
        try {
            var data = {};

            data.groupids = message.data.groupids;

            let usersOfGroups = await Groups.getUsers(data);
            return success.sendData(usersOfGroups);
        } catch (err) {
            return errors.unknownError;
        }
    },

    getPolls: async (message) => {
        console.log('GroupController.getPolls');
        try {
            var data = {};

            data.groupid = message.data.groupid;

            let pollsInGroup = await Groups.getPolls(data);
            return success.sendData(pollsInGroup);
        } catch (err) {
            return errors.unknownError;
        }
    }
}