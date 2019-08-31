const dbTransactions = require('../db/session');

const GroupUsers = require('../db/groupusers');
const Users = require('../db/users');

const errors = require('../helpers/errorstousers');
const success = require('../helpers/successtousers');
const replyHelper = require('../helpers/replyhelper');

const ControllerHelper = require('./ControllerHelper');

module.exports = {

  /**
     * To add an user to the group.
     * Only ADMINs can add an user to the group.
     *
     * Tested on: 19-Aug-2019
     * {"module":"groups", "event":"addUser", "messageid":5818,
     * "data":{"groupid": 3000, "user_id":2001, "permission":"USER"}}
     *
     * @param {*} message
     * @returns
     */
  addUser: async (message) => {
    console.log('GroupController.addUser');
    if (!message.user_id ||
      !message.data.user_id ||
      !message.data.groupid ||
      !message.data.permission) {
      return await replyHelper.prepareError(message,
          null, errors.invalidData);
    }

    try {
      // Start transaction
      dbsession = await dbTransactions.startSession();

      // Check the 'user-being-added' is available.
      // If he is, then he can be added to the group.
      const isUserExist = Users.isUserExist(message.data.user_id);
      if (isUserExist == false) {
        return await replyHelper.prepareError(message,
            dbsession, errors.errorUserNotExists);
      }

      // Check 'user-being-added' is already a member
      const isMemberData = {
        groupid: message.data.groupid,
        user_id: message.data.user_id,
      };
      const isMember = await GroupUsers.isMember(isMemberData);
      if (isMember == true) {
        return await replyHelper.prepareError(message,
            dbsession, errors.errorUserIsMember);
      }

      // Check the 'user who made the request' is an ADMIN.
      //  If he is, then he can add user.
      const isAdminData = {
        groupid: message.data.groupid,
        user_id: message.user_id,
      };
      const isAdmin = await GroupUsers.isAdmin(isAdminData);
      if (isAdmin == false) {
        return await replyHelper.prepareError(message,
            dbsession, errors.errorNotAnAdminUser);
      }

      // Now add the user
      const data = {
        groupid: message.data.groupid,
        user_id: message.data.user_id,
        addedby: message.user_id,
        permission: message.data.permission,
        operation: 'addUser',
      };
      await GroupUsers.addUser(data);
      await dbTransactions.commitTransaction(dbsession);

      // Inform group members about the new user.
      ControllerHelper.informGroupUserUpdate(data.groupid, data);

      const replyData = {
        status: success.userAddedToGroup,
      };
      return await replyHelper.prepareSuccess(message, replyData);
    } catch (err) {
      console.log(err);
      return await replyHelper.prepareError(message,
          dbsession, errors.unknownError);
    }
  },

  /**
     * To change user's permission in the group.
     * Only ADMINs can change other users' permission.
     *
     * Tested on: 19-Aug-2019
     * {"module":"groups", "event":"changeUserPermission", "messageid":1515,
     * "data":{"groupid": 3000, "user_id":2001, "permission":"ADMIN"}}
     *
     * @param {*} message
     * @returns
     */
  changeUserPermission: async (message) => {
    if (!message.user_id ||
      !message.data.user_id ||
      !message.data.groupid ||
      !message.data.permission) {
      return await replyHelper.prepareError(message,
          null, errors.invalidData);
    }

    console.log('GroupController.changeUserPermission');
    try {
      // Start transaction
      dbsession = await dbTransactions.startSession();

      // Check user is already a member
      const isMemberData = {
        groupid: message.data.groupid,
        user_id: message.data.user_id,
      };
      const isMember = await GroupUsers.isMember(isMemberData);
      if (isMember == false) {
        return await replyHelper.prepareError(message,
            dbsession, errors.errorUserIsNotMember);
      }

      // Check the user is an ADMIN. If he is, then he can add user.
      const isAdminData = {
        groupid: message.data.groupid,
        user_id: message.user_id,
      };
      const isAdmin = await GroupUsers.isAdmin(isAdminData);
      if (isAdmin == false) {
        return await replyHelper.prepareError(message,
            dbsession, errors.errorNotAnAdminUser);
      }

      // Permission can be ADMIN or USER. Cant be CREATOR
      if (message.data.permission != 'ADMIN' &&
        message.data.permission != 'USER') {
        return await replyHelper.prepareError(message,
            dbsession, errors.errorNotAllowedToSetThisPermission);
      }

      // Todo: Do we need to check with existing permission
      // and throw an error, if existing and the requested one are same

      const data = {
        groupid: message.data.groupid,
        user_id: message.data.user_id,
        permission: message.data.permission,
        operation: 'changeUser',
      };
      await GroupUsers.changeUserPermission(data);
      await dbTransactions.commitTransaction(dbsession);

      // Inform group members about the permission change.
      const redisData = {
        gid: data.groupid,
        uid: data.user_id,
        perm: data.permission,
        op: 'cUP',
      };
      ControllerHelper.informGroupUserUpdate(data.groupid,
          JSON.stringify(redisData));

      const replyData = {
        status: success.userPermissionChangedInGroup,
      };
      return await replyHelper.prepareSuccess(message, replyData);
    } catch (err) {
      console.log(err);
      return await replyHelper.prepareError(message,
          dbsession, errors.unknownError);
    }
  },

  /**
     * To remove an user from the group.
     * Only ADMINs can remove an user from the group.
     *
     * Tested on: Pending
     * {"module":"groups", "event":"removeUser", "messageid":874984,
     * "data":{"groupid": 3000, "user_id":2001}}-
     *
     * @param {*} message
     * @returns
     */
  removeUser: async (message) => {
    if (!message.user_id ||
      !message.data.user_id ||
      !message.data.groupid) {
      return await replyHelper.prepareError(message,
          null, errors.invalidData);
    }

    console.log('GroupController.removeUser');
    try {
      // Start transaction
      dbsession = await dbTransactions.startSession();

      // Check user is already a member
      const isMemberData = {
        groupid: message.data.groupid,
        user_id: message.data.user_id,
      };
      const isMember = await GroupUsers.isMember(isMemberData);
      if (isMember == false) {
        return await replyHelper.prepareError(message,
            dbsession, errors.errorUserIsNotMember);
      }

      // Check the user is an ADMIN. If he is, then he can add user.
      const isAdminData = {
        groupid: message.data.groupid,
        user_id: message.user_id,
      };
      const isAdmin = await GroupUsers.isAdmin(isAdminData);
      if (isAdmin == false) {
        return await replyHelper.prepareError(message,
            dbsession, errors.errorNotAnAdminUser);
      }

      // remove the user.
      const data = {
        groupid: message.data.groupid,
        user_id: message.data.user_id,
      };
      await GroupUsers.removeUser(data);
      await dbTransactions.commitTransaction(dbsession);

      // Inform group members about the user removal.
      const redisData = {
        gid: data.groupid,
        uid: data.user_id,
        op: 'rU',
      };
      ControllerHelper.informGroupUserUpdate(data.groupid, redisData);

      // TODO: inform removed user

      const replyData = {
        status: success.userRemovedFromGroup,
      };
      return await replyHelper.prepareSuccess(message, replyData);
    } catch (err) {
      console.log(err);
      return await replyHelper.prepareError(message,
          dbsession, errors.unknownError);
    }
  },

  /**
     * Get all users of a group. (user_ids only)
     *
     * Tested on: Pending
     * {"module":"groups", "event":"getUsersOfGroups", "messageid":15185,
     * "data":{"groupids":[1001, 1000]}}
     *
     * @param {*} message
     * @returns
     */
  getUsersOfGroup: async (message) => {
    console.log('GroupController.getUsersOfGroups');
    if (!message.user_id ||
      !message.data.groupid) {
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
      const userIsMember = await GroupUsers.isMember(data);
      if (!userIsMember) {
        return await replyHelper.prepareError(message,
            null, errors.errorUserIsNotMember);
      }

      // Todo: use redis
      const usersOfGroups = await GroupUsers.getUsers(data.groupid);
      return await replyHelper.prepareSuccess(message, usersOfGroups);
    } catch (err) {
      console.log(err);
      return await replyHelper.prepareError(message,
          null, errors.unknownError);
    }
  },
};
