const dbTransactions = require('../db/session');

const GroupUsers = require('../db/groupusers');
const GroupInfo = require('../db/groupinfo');
const GroupPolls = require('../db/grouppolls');

const errors = require('../helpers/errorstousers');
const success = require('../helpers/successtousers');
const replyHelper = require('../helpers/replyhelper');

const sequenceCounter = require('../db/sequencecounter');

const ControllerHelper = require('./ControllerHelper');

// This file all functions to create and modify group info.
module.exports = {

  /**
     * To create a group.
     * The user who creates the group is ADMIN.
     * No one will be notified except the creator.
     *
     * Tested on: 17-Aug-2019
     * {"module":"groups", "event":"create", "messageid":32352,
     * "data":{"name":"group name", "desc":"some description about the group"}}
     *
     * @param {*} message
     * @returns
     */
  create: async (message) => {
    console.log('GroupController.create');
    if (!message.data ||
      !message.data.name ||
      !message.data.desc ||
      !message.user_id) {
      return await replyHelper.prepareError(message,
          null, errors.invalidData);
    }

    try {
      // Start transaction
      dbsession = await dbTransactions.startSession();

      // Get id for group
      const groupid = await sequenceCounter.getNextSequenceValue('group');

      // Prepare data
      const groupData = {
        id: groupid,
        name: message.data.name,
        desc: message.data.desc,
        createdby: message.user_id,
        time: new Date(),
      };
      await GroupInfo.create(groupData);

      // Adding user with ADMIN privileges
      const data = {
        groupid: groupid,
        user_id: message.user_id,
        addedby: message.user_id,
        permission: 'ADMIN',
      };
      await GroupUsers.addUser(data);
      await dbTransactions.commitTransaction(dbsession);

      const replyData = {
        groupid: groupid,
        createdAt: groupData.time.getTime(),
        status: success.groupCreated,
      };
      return await replyHelper.prepareSuccess(message, replyData);
    } catch (err) {
      console.log(err);
      return await replyHelper.prepareError(message,
          dbsession, errors.unknownError);
    }
  },

  /**
     * To change the title of the group.
     * Online users will get notification through fanout process.
     * Offline users can update themselves when they come online.
     * The 'update' information is redis will expire in 30 days.
     * If a user comes online after 30 days,
     * then the user should do a fulll scan.
     *
     * Tested on: 17-Aug-2019
     * {"module":"groups", "event":"changeTitle", "messageid":9912,
     * "data":{"groupid": 3000, "name":"new group title"}}
     *
     * @param {*} message
     * @returns
     */
  changeTitle: async (message) => {
    console.log('GroupController.changeTitle');
    if (!message.data ||
      !message.data.groupid ||
      !message.user_id) {
      return await replyHelper.prepareError(message,
          null, errors.invalidData);
    }

    try {
      // Start transaction
      dbsession = await dbTransactions.startSession();

      // Check user is a member. If he is, then he can change the title
      const isMemberData = {
        groupid: message.data.groupid,
        user_id: message.user_id,
      };
      const isMember = await GroupUsers.isMember(isMemberData);
      if (isMember == false) {
        return await replyHelper.prepareError(message,
            dbsession, errors.errorUserIsNotMember);
      }

      // Change the title
      const data = {
        groupid: message.data.groupid,
        name: message.data.name,
        changedby: message.user_id,
      };
      await GroupInfo.changeTitle(data);
      await dbTransactions.commitTransaction(dbsession);

      // TODO: create entries in transaction tables
      // TODO: Notify all the online users of the group (async)
      ControllerHelper.informGroupUpdate(data.groupid);

      const replyData = {
        status: success.groupTitleChanged,
      };
      return await replyHelper.prepareSuccess(message, replyData);
    } catch (err) {
      console.log(err);
      return await replyHelper.prepareError(message,
          dbsession, errors.unknownError);
    }
  },

  /**
     * To change the description of the group.
     * Online users will get notification through fanout process.
     * Offline users can update themselves when they come online.
     * The 'update' information is redis will expire in 30 days.
     * If a user comes online after 30 days,
     * then the user should do a fulll scan.
     *
     * Tested on: 17-Aug-2019
     * {"module":"groups", "event":"changeDesc", "messageid":9918,
     * "data":{"groupid": 3000, "desc":"some new group description"}}
     *
     * @param {*} message
     * @returns
     */
  changeDesc: async (message) => {
    console.log('GroupController.changeDesc');
    if (!message.data ||
      !message.data.groupid ||
      !message.user_id) {
      return await replyHelper.prepareError(message,
          null, errors.invalidData);
    }

    try {
      // Start transaction
      dbsession = await dbTransactions.startSession();

      // Check user is a member. If he is, then he can change the title
      const isMemberData = {
        groupid: message.data.groupid,
        user_id: message.user_id,
      };
      const isMember = await GroupUsers.isMember(isMemberData);
      if (isMember == false) {
        return await replyHelper.prepareError(message,
            dbsession, errors.errorUserIsNotMember);
      }

      // Change the desc
      const data = {
        groupid: message.data.groupid,
        desc: message.data.desc,
        changedby: message.user_id,
      };
      await GroupInfo.changeDesc(data);
      await dbTransactions.commitTransaction(dbsession);

      // TODO: create entries in transaction tables
      // TODO: Notify all the online users of the group (async)
      ControllerHelper.informGroupUpdate(data.groupid);

      const replyData = {
        status: success.groupDescChanged,
      };
      return await replyHelper.prepareSuccess(message, replyData);
    } catch (err) {
      console.log(err);
      return await replyHelper.prepareError(message,
          dbsession, errors.unknownError);
    }
  },

  /**
     * Not usable until now.
     * No idea of deleting a group.
     *
     * @param {*} message
     * @returns
     */
  delete: async (message) => {
    console.log('GroupController.delete');
    if (!message.data ||
      !message.data.groupid ||
      !message.user_id) {
      return await replyHelper.prepareError(message,
          null, errors.invalidData);
    }

    try {
      // Start transaction
      dbsession = await dbTransactions.startSession();

      // Check the user is an ADMIN.
      // If he is, then he can delete the group.
      const isAdminData = {
        groupid: message.data.groupid,
        user_id: message.user_id,
      };
      const isAdmin = await GroupUsers.isAdmin(isAdminData);
      if (isAdmin == false) {
        return await replyHelper.prepareError(message,
            dbsession, errors.errorNotAnAdminUser);
      }

      const data = {
        groupid: message.data.groupid,
        deleteby: message.user_id,
      };
      await GroupInfo.delete(data); // mark as deleted

      // TODO: delete usersofgroup
      // TODO: create entries in transaction tables
      // TODO: Notify all the online users of the group (async) ...
      // ... prior to delete all users take the list and then delete

      await dbTransactions.commitTransaction(dbsession);
      return success.groupDeleted;
    } catch (err) {
      console.log(err);
      return await replyHelper.prepareError(message,
          dbsession, errors.unknownError);
    }
  },

  /**
     * To get the user's group info.
     * //Todo: Need to check whether this is usable.
     *
     * Tested on: 17-Aug-2019
     * {"module":"groups", "event":"getMyGroupsInfo", "messageid":4641}
     *
     * @param {*} message
     * @returns
     */
  getMyGroupsInfo: async (message) => {
    console.log('UserController.getGroups');
    if (!message.user_id) {
      return await replyHelper.prepareError(message,
          null, errors.invalidData);
    }

    try {
      const groups = await GroupUsers.getGroupsOfUser(message.user_id);

      const groupids = [];
      groups.forEach((groupUser) => {
        groupids.push(groupUser.groupid);
      });

      // Prepare data
      const data = {
        groupids: groupids,
      };
      const groupsInfo = await GroupInfo.getGroupsInfo(data);
      return await replyHelper.prepareSuccess(message, groupsInfo);
    } catch (err) {
      console.log(err);
      return await replyHelper.prepareError(message,
          null, errors.unknownError);
    }
  },

  /**
     * To get group information for the given groupids.
     *
     * Tested on: 17-Aug-2019
     * {"module":"groups", "event":"getInfo", "messageid":8971,
     * "data":{"groupids":[3001, 3002]}}
     *
     * @param {*} message
     * @returns
     */
  getInfo: async (message) => {
    if (!message.data ||
      !message.data.groupids) {
      return await replyHelper.prepareError(message,
          null, errors.invalidData);
    }

    console.log('GroupController.getGroupsInfo');
    try {
      const data = {
        groupids: message.data.groupids,
      };
      const groupsInfo = await GroupInfo.getGroupsInfo(data);
      return await replyHelper.prepareSuccess(message, groupsInfo);
    } catch (err) {
      console.log(err);
      return await replyHelper.prepareError(message,
          null, errors.unknownError);
    }
  },

  /**
     * To get polls of a group (only the metainfo).
     * To get pollinfo or pollresult, the user should call the respective fn()
     *
     * Tested on: 19-06-2019
     * {"module":"groups", "event":"getPolls", "messageid":8435,
     * "data":{"groupid": 1004}}
     * @param {*} message
     * @returns
     */
  getPolls: async (message) => {
    console.log('GroupController.getPolls');
    if (!message.data ||
      !message.data.groupid ||
      !message.user_id) {
      return await replyHelper.prepareError(message,
          null, errors.invalidData);
    }

    try {
      // Prepare data
      const data = {
        groupid: message.data.groupid,
        user_id: message.user_id,
      };

      // Check user in group. If he is, then he can get the requested info
      // Todo: use redis
      const userIsMember = await GroupUsers.isMember(data);
      if (!userIsMember) {
        return await replyHelper.prepareError(message,
            null, errors.errorUserIsNotMember);
      }

      // Todo: use redis
      const pollsInGroup = await GroupPolls.getPolls(data.groupid);
      return await replyHelper.prepareSuccess(message, pollsInGroup);
    } catch (err) {
      console.log(err);
      return await replyHelper.prepareError(message,
          null, errors.unknownError);
    }
  },
};
