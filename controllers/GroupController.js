const VError = require('verror');
const assert = require('assert');
const check = require('check-types');

const errors = require('../helpers/errorstousers');
const success = require('../helpers/successtousers');

const dbTransactions = require('../db/session');
const seqCounter = require('../db/sequencecounter');
const GroupUsers = require('../db/groupusers');
const GroupInfo = require('../db/groupinfo');
const GroupPolls = require('../db/grouppolls');

const ControllerHelper = require('./ControllerHelper');

// This file all functions to create and modify group info.
module.exports = {

  /**
     * This function creates a group.
     * The user who creates the group is ADMIN.
     * No one will be notified except the creator.
     *
     * Tested on: 17-Aug-2019
     * {"module":"groups", "event":"create", "messageid":32352, "data":{"name":"group name", "desc":"some description about the group"}}
     *
     * @param {number} userid   ID of the user who creates the group
     * @param {string} name     Name of the group
     * @param {string} desc     Description of the group
     * @return {Status}
     */
  create: async (userid, name, desc) => {
    console.log('GroupController.create');
    assert.ok(check.number(userid),
        'argument \'userid\' must be a number');
    assert.ok(check.nonEmptyString(name),
        'argument \'name\' must be a nonEmptyString');
    assert.ok(check.nonEmptyString(desc),
        'argument \'desc\' must be a nonEmptyString');

    let dbsession = null;
    try {
      // Start transaction
      dbsession = await dbTransactions.start();

      // Get id for the group
      const groupid = await seqCounter.getNextValue('group');

      // Prepare data
      const groupData = {
        id: groupid,
        name: name,
        desc: desc,
        createdby: userid,
        time: new Date(),
      };
      await GroupInfo.create(groupData);

      // Adding user with ADMIN privileges
      const data = {
        groupid: groupid,
        user_id: userid,
        addedby: userid,
        permission: 'ADMIN',
      };
      await GroupUsers.addUser(data);
      await dbTransactions.commit(dbsession);

      const replyData = {
        groupid: groupid,
        createdAt: groupData.time.getTime(),
        status: success.groupCreated,
      };
      return replyData;
    } catch (err) {
      await dbTransactions.abort(dbsession);
      throw new VError(err, errors.internalError.message);
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
     * {"module":"groups", "event":"changeTitle", "messageid":9912, "data":{"groupid": 3000, "name":"new group title"}}
     *
     * @param {number} userid   ID of the user who changes the title
     * @param {number} groupid  ID of the group
     * @param {string} name     New title for the group
     * @return {Status}
     *
     * @throws {errors.errorUserIsNotMember}
     *  When the user is not a member of the group
     */
  changeTitle: async (userid, groupid, name) => {
    console.log('GroupController.changeTitle');
    assert.ok(check.number(userid),
        'argument \'userid\' must be a number');
    assert.ok(check.number(groupid),
        'argument \'groupid\' must be a number');
    assert.ok(check.nonEmptyString(name),
        'argument \'name\' must be a nonEmptyString');

    // Check user is a member. If he is, then he can change the title
    const isMember = await GroupUsers.isMember(groupid, userid);
    if (isMember == false) {
      throw new VError(errors.errorUserIsNotMember.message);
    }

    let dbsession = null;
    try {
      // Start transaction
      dbsession = await dbTransactions.start();

      // Change the title
      const data = {
        groupid: groupid,
        name: name,
        changedby: userid,
      };
      await GroupInfo.changeTitle(data);
      await dbTransactions.commit(dbsession);

      // TODO: create entries in transaction tables
      // TODO: Notify all the online users of the group (async)
      ControllerHelper.informGroupUpdate(groupid);

      const replyData = {
        status: success.groupTitleChanged,
      };
      return replyData;
    } catch (err) {
      await dbTransactions.abort(dbsession);
      throw new VError(err, errors.internalError.message);
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
     * {"module":"groups", "event":"changeDesc", "messageid":9918, "data":{"groupid": 3000, "desc":"some new group description"}}
     *
     * @param {number} userid   ID of the user who changes the desc
     * @param {number} groupid  ID of the group
     * @param {string} desc     New description for the group
     * @return {Status}
     *
     * @throws {errors.errorUserIsNotMember}
     *  When the user is not a member of the group
     */
  changeDesc: async (userid, groupid, desc) => {
    console.log('GroupController.changeDesc');
    assert.ok(check.number(userid),
        'argument \'userid\' must be a number');
    assert.ok(check.number(groupid),
        'argument \'groupid\' must be a number');
    assert.ok(check.nonEmptyString(desc),
        'argument \'desc\' must be a nonEmptyString');

    // Check user is a member. If he is, then he can change the title
    const isMember = await GroupUsers.isMember(groupid, userid);
    if (isMember == false) {
      throw new VError(errors.errorUserIsNotMember.message);
    }

    let dbsession = null;
    try {
      // Start transaction
      dbsession = await dbTransactions.start();

      // Change the desc
      const data = {
        groupid: groupid,
        desc: desc,
        changedby: userid,
      };
      await GroupInfo.changeDesc(data);
      await dbTransactions.commit(dbsession);

      // Send update to group members
      ControllerHelper.informGroupUpdate(groupid);

      const replyData = {
        status: success.groupDescChanged,
      };
      return replyData;
    } catch (err) {
      await dbTransactions.abort(dbsession);
      throw new VError(err, errors.internalError.message);
    }
  },

  /**
     * Not usable until now.
     * No idea of deleting a group.
     * ONLY ADMINs can call this.
     *
     * @param {number} userid   ID of the user
     * @param {number} groupid  ID of the group
     * @return {Status}
     *
     * @throws {errors.errorNotAnAdminUser}
     *  When the user is not an ADMIN of the group
     */
  delete: async (userid, groupid) => {
    console.log('GroupController.delete');
    assert.ok(check.number(userid),
        'argument \'userid\' must be a number');
    assert.ok(check.number(groupid),
        'argument \'groupid\' must be a number');

    let dbsession = null;
    try {
      // Check the user is an ADMIN.
      // If he is, then he can delete the group.
      const isAdmin = await GroupUsers.isAdmin(groupid, userid);
      if (isAdmin == false) {
        throw new VError(errors.errorNotAnAdminUser.message);
      }

      // Start transaction
      dbsession = await dbTransactions.start();

      const data = {
        groupid: groupid,
        deleteby: userid,
      };
      await GroupInfo.delete(data); // mark as deleted

      // TODO: delete usersofgroup
      // TODO: create entries in transaction tables
      // TODO: Notify all the online users of the group (async) ...
      // ... prior to delete all users take the list and then delete

      await dbTransactions.commit(dbsession);
      const replyData = {
        status: success.groupDeleted,
      };
      return replyData;
    } catch (err) {
      await dbTransactions.abort(dbsession);
      throw new VError(err, errors.internalError.message);
    }
  },

  /**
     * To get the user's group info.
     * //Todo: Need to check whether this is usable.
     *
     * Tested on: 17-Aug-2019
     * {"module":"groups", "event":"getMyGroupsInfo", "messageid":4641}
     *
     * @param {number} userid   ID of the user
     * @return {GroupInfo[]}
     */
  getMyGroupsInfo: async (userid) => {
    console.log('UserController.getGroups');
    assert.ok(check.number(userid),
        'argument \'userid\' must be a number');

    try {
      // Get user groups
      const groups = await GroupUsers.getGroupsOfUser(userid);

      // Populate groupids array
      const groupids = [];
      groups.forEach((groupUser) => {
        groupids.push(groupUser.groupid);
      });

      // Get groupinfo
      return await GroupInfo.getGroupsInfo(groupids);
    } catch (err) {
      throw new VError(err, errors.internalError.message);
    }
  },

  /**
       * To get group information for the given groupids.
       *
       * Tested on: 17-Aug-2019
       * {"module":"groups", "event":"getInfo", "messageid":8971, "data":{"groupids":[3001, 3002]}}
       *
       * @param {number[]} groupids IDs of groups for which info is needed
       * @return {GroupInfo[]}
       */
  getInfo: async (groupids) => {
    console.log('GroupController.getGroupsInfo');
    assert.ok(check.array.of.number(groupids),
        'argument \'groupids\' must be number[]');

    try {
      return await GroupInfo.getGroupsInfo(groupids);
    } catch (err) {
      throw new VError(err, errors.internalError.message);
    }
  },

  /**
     * To get polls of a group (only the metainfo).
     * To get pollinfo or pollresult, the user should call the respective fn()
     *
     * Tested on: 19-06-2019
     * {"module":"groups", "event":"getPolls", "messageid":8435, "data":{"groupid": 1004}}
     *
     * @param {number} userid   ID of the user
     * @param {number} groupid  ID of the group
     * @return {GroupPolls[]}
     *
     * @throws {errors.errorUserIsNotMember}
     *  When the user is not a member of the group
     */
  getPolls: async (userid, groupid) => {
    console.log('GroupController.getPolls');
    assert.ok(check.number(userid),
        'argument \'userid\' must be a number');
    assert.ok(check.number(groupid),
        'argument \'groupid\' must be a number');

    try {
      // Check user in group. If he is, then he can get the requested info
      // Todo: use redis
      const userIsMember = await GroupUsers.isMember(groupid, userid);
      if (!userIsMember) {
        throw new VError(errors.errorUserIsNotMember.message);
      }

      // Todo: use redis
      return await GroupPolls.getPolls(groupid);
    } catch (err) {
      throw new VError(err, errors.internalError.message);
    }
  },
};
