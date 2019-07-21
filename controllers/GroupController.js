var dbTransactions = require('../db/session');

let GroupUsers = require('../db/groupusers');
let GroupInfo = require('../db/groupinfo');
let GroupPolls = require('../db/grouppolls');
var Users = require('../db/users');

var errors = require('../helpers/errorstousers');
var success = require('../helpers/successtousers');
var replyHelper = require('../helpers/replyhelper');

var sequenceCounter = require('../db/sequencecounter');

let ControllerHelper = require('./ControllerHelper');

const redClient = require('../redis/redclient');
const redHelper = require('../redis/redhelper');
const keyPrefix = require('../redis/key_prefix');

module.exports = {
    //Tested on: 21-06-2019
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
                createdby: message.user_id,
                time: new Date()
            }
            await GroupInfo.create(groupData);

            //Adding user with ADMIN privileges
            let userBeAdmin = {
                groupid: groupid,
                user_id: message.user_id,
                addedby: message.user_id,
                permission: 'ADMIN'
            }
            await GroupUsers.addUser(userBeAdmin);
            await redClient.sadd(keyPrefix.groupUsers + groupData.groupid, groupData.createdby);
            await redHelper.updateGroupInfo(groupData.id, groupData.name, groupData.desc, groupData.createdby, groupData.time.getTime());
            await dbTransactions.commitTransaction(dbsession);

            let replyData = {
                groupid: groupid,
                createdAt: groupData.time.getTime(),
                status: success.groupCreated
            }
            return await replyHelper.prepareSuccess(message, replyData);
        } catch (err) {
            console.log(err);
            return await replyHelper.prepareError(message, dbsession, errors.unknownError);
        }
    },

    //Tested on: 19-06-2019
    //{"module":"groups", "event":"changeTitle", "messageid":9912, "data":{"groupid": 3000, "name":"new group title"}}
    changeTitle: async (message) => {
        console.log('GroupController.changeTitle');
        try {
            //Start transaction
            dbsession = await dbTransactions.startSession();

            //Check user is a member. If he is, then he can change the title
            let isMemberData = {
                groupid: message.data.groupid,
                user_id: message.user_id,
            };
            const isMember = await GroupUsers.isMember(isMemberData);
            if (isMember == false) {
                return await replyHelper.prepareError(message, dbsession, errors.errorUserIsNotMember);
            }

            //Change the title
            let data = {
                groupid: message.data.groupid,
                name: message.data.name,
                changedby: message.user_id
            };
            await GroupInfo.changeTitle(data);
            await redHelper.updateGroupName(data.groupid, data.name);
            await dbTransactions.commitTransaction(dbsession);

            //TODO: create entries in transaction tables
            //TODO: Notify all the online users of the group (async)
            ControllerHelper.informUsers(data.groupid, data);
            ControllerHelper.informGroupUpdate(data.groupid);

            let replyData = {
                status: success.groupTitleChanged
            }
            return await replyHelper.prepareSuccess(message, replyData);
        } catch (err) {
            console.log(err);
            return await replyHelper.prepareError(message, dbsession, errors.unknownError);
        }
    },

    //Tested on: 20-06-2019
    //{"module":"groups", "event":"changeDesc", "messageid":9918, "data":{"groupid": 3000, "desc":"some new group description"}}
    changeDesc: async (message) => {
        console.log('GroupController.changeDesc');
        try {
            //Start transaction
            dbsession = await dbTransactions.startSession();

            //Check user is a member. If he is, then he can change the title
            let isMemberData = {
                groupid: message.data.groupid,
                user_id: message.user_id,
            };
            const isMember = await GroupUsers.isMember(isMemberData);
            if (isMember == false) {
                return await replyHelper.prepareError(message, dbsession, errors.errorUserIsNotMember);
            }

            //Change the desc
            let data = {
                groupid: message.data.groupid,
                desc: message.data.desc,
                changedby: message.user_id
            };
            await GroupInfo.changeDesc(data);
            await redHelper.updateGroupDesc(data.groupid, data.desc);
            await dbTransactions.commitTransaction(dbsession);

            //TODO: create entries in transaction tables
            //TODO: Notify all the online users of the group (async)
            ControllerHelper.informUsers(data.groupid, data);
            ControllerHelper.informGroupUpdate(data.groupid);

            let replyData = {
                status: success.groupDescChanged
            }
            return await replyHelper.prepareSuccess(message, replyData);
        } catch (err) {
            console.log(err);
            return await replyHelper.prepareError(message, dbsession, errors.unknownError);
        }
    },

    delete: async (message) => {
        console.log('GroupController.delete');
        try {
            //Start transaction
            dbsession = await dbTransactions.startSession();

            //Check the user is an ADMIN. If he is, then he can delete the group.
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
                deleteby: message.user_id
            };
            await GroupInfo.delete(data);  //mark as deleted

            //TODO: delete usersofgroup
            //TODO: create entries in transaction tables
            //TODO: Notify all the online users of the group (async) ... 
            // ... prior to delete all users take the list and then delete

            await dbTransactions.commitTransaction(dbsession);
            return success.groupDeleted;
        } catch (err) {
            console.log(err);
            return await replyHelper.prepareError(message, dbsession, errors.unknownError);
        }
    },

    getMyGroupsInfo: async (message) => {
        console.log('UserController.getGroups');
        try {
            let groups = await GroupUsers.getGroupsOfUser(message.user_id);
            
            let groupids = [];
            groups.forEach(groupUser => {
                groupids.push(groupUser.groupid);
            });

            //Prepare data
            let data = {
                groupids: groupids
            }
            let groupsInfo = await GroupInfo.getGroupsInfo(data);
            return await replyHelper.prepareSuccess(message, groupsInfo);
        } catch (err) {
            console.log(err);
            return await replyHelper.prepareError(message, null, errors.unknownError);
        }
    },

    //Tested on: 18-06-2019
    //{"module":"groups", "event":"getGroupsInfo", "messageid":8971, "data":{"groupids":[1001, 1000]}}
    getInfo: async (message) => {
        console.log('GroupController.getGroupsInfo');
        try {
            let data = {
                groupids: message.data.groupids
            }
            let groupsInfo = await GroupInfo.getGroupsInfo(data);
            return await replyHelper.prepareSuccess(message, groupsInfo);
        } catch (err) {
            console.log(err);
            return await replyHelper.prepareError(message, null, errors.unknownError);
        }
    },

    //Tested on: 19-06-2019
    //{"module":"groups", "event":"getPolls", "messageid":8435, "data":{"groupid": 1004}}
    getPolls: async (message) => {
        console.log('GroupController.getPolls');
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

            let pollsInGroup = await GroupPolls.getPolls(data.groupid);
            return await replyHelper.prepareSuccess(message, pollsInGroup);
        } catch (err) {
            console.log(err);
            return await replyHelper.prepareError(message, null, errors.unknownError);
        }
    },

    getGroupUpdates: async (message) => {
        console.log('GroupController.getGroupUpdates');
        try {
            //Prepare data
            let data = {
                user_id: message.user_id
            }

            let updatedGroupIds = await redClient.smembers(keyPrefix.groupUpdate + data.user_id);
            let updatedGroupInfo = await redHelper.getGroupInfo(updatedGroupIds);

            return await replyHelper.prepareSuccess(message, updatedGroupInfo);
        } catch (err) {
            console.log(err);
            return await replyHelper.prepareError(message, null, errors.unknownError);
        }
    },
}