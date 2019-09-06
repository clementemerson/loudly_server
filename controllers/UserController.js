const assert = require('assert');
const check = require('check-types');

const errors = require('../helpers/errorstousers');
const success = require('../helpers/successtousers');

const dbTransactions = require('../db/session');
const Users = require('../db/users');
const GroupUsers = require('../db/groupusers');
const UserPolls = require('../db/userpolls');

const redHelper = require('../redis/redhelper');

module.exports = {
  /**
         * Get userinfo from their phonenumbers
         *
         * Tested on: 17-Aug-2019
         * {"module":"users", "event":"getUsersFromPhoneNumbers", "messageid":3432, "data": {"phoneNumbers":["+919884386484"]}}
         *
         * @param {number} userid           ID of the user
         * @param {string[]} phoneNumbers   Phonenumbers of the user's contact
         * @return {UsersInfo[]}
         */
  getUsersFromPhoneNumbers: async (userid, phoneNumbers) => {
    console.log('UserController.getUsersFromPhoneNumbers');
    assert.ok(check.number(userid),
        'argument \'userid\' must be a number');
    assert.ok(check.array.of.nonEmptyString(phoneNumbers),
        'argument \'phoneNumbers\' must be nonEmptyString[]');

    try {
      const users =
                await redHelper.getUserIdsByPhone(phoneNumbers);

      const userids = [];
      users.forEach((oneUser) => {
        userids.push(parseInt(oneUser.id));
      });

      return await Users.getUserInfoByUserIds(userids);
    } catch (err) {
      errors.wrapError(err);
    }
  },

  /**
         * Get user's group. One time usage, when user is logging in.
         *
         * Tested on: 17-Aug-2019
         * {"module":"users", "event":"getGroups", "messageid":4641}
         *
         * @param {number} userid    ID of the user
         * @return {GroupUser[]}
         */
  getGroups: async (userid) => {
    console.log('UserController.getGroups');
    assert.ok(check.number(userid),
        'argument \'userid\' must be a number');

    try {
      return await GroupUsers.getGroupsOfUser(userid);
    } catch (err) {
      errors.wrapError(err);
    }
  },

  /**
         * To get user created polls. One time usage, when user is logging in.
         *
         * Tested on: 17-Aug-2019
         * {"module":"users", "event":"getPolls", "messageid":4641}
         *
         * @param {number} userid    ID of the user
         * @return {UserPoll[]}
         */
  getPolls: async (userid) => {
    console.log('UserController.getPolls');
    assert.ok(check.number(userid),
        'argument \'userid\' must be a number');

    try {
      return await UserPolls.getPolls(userid);
    } catch (err) {
      errors.wrapError(err);
    }
  },

  /**
         * To get userinfo for the given userids.
         *
         * Tested on: 17-Aug-2019
         * {"module":"users", "event":"getInfo", "messageid":9961, "data":{"userids":[2000,2001]}}
         *
         * @param {number[]} userids    IDs of the users
         * @return {UsersInfo[]}
         */
  getInfo: async (userids) => {
    console.log('UserController.getInfo');
    assert.ok(check.array.of.number(userids),
        'argument \'userids\' must be number[]');

    try {
      return await Users.getUserInfoByUserIds(userids);
    } catch (err) {
      errors.wrapError(err);
    }
  },

  /**
         * To change one's display name.
         *
         * Tested on: 17-Aug-2019
         * {"module":"users", "event":"changeName", "messageid":2154, "data":{"name":"Clement"}}
         *
         * @param {number} userid    ID of the user
         * @param {string} name      New name of the user
         * @return {Status}
         */
  changeName: async (userid, name) => {
    console.log('UserController.changeName');
    assert.ok(check.number(userid),
        'argument \'userid\' must be a number');
    assert.ok(check.nonEmptyString(name),
        'argument \'name\' must be a nonEmptyString');

    let dbsession = null;
    try {
      // Start transaction
      dbsession = await dbTransactions.start();

      // Change the name
      await Users.changeName(userid, name);
      await dbTransactions.commit(dbsession);

      const replyData = {
        status: success.userNameChanged,
      };
      return replyData;
    } catch (err) {
      await dbTransactions.abort(dbsession);
      errors.wrapError(err);
    }
  },

  /**
         * To change one's status message
         *
         * Tested on: 17-Aug-2019
         * {"module":"users", "event":"changeStatusMsg", "messageid":4641, "data":{"statusmsg":"some status"}}
         *
         * @param {number} userid        ID of the user
         * @param {string} statusmsg     New statusmsg of the user
         * @return {Status}
         */
  changeStatusMsg: async (userid, statusmsg) => {
    console.log('UserController.changeStatusMsg');
    assert.ok(check.number(userid),
        'argument \'userid\' must be a number');
    assert.ok(check.nonEmptyString(statusmsg),
        'argument \'statusmsg\' must be a nonEmptyString');

    let dbsession = null;
    try {
      // Start transaction
      dbsession = await dbTransactions.start();

      // Change the msg
      await Users.changeStatusMsg(userid, statusmsg);
      await dbTransactions.commit(dbsession);
      console.log('commited');
      const replyData = {
        status: success.userStatusChanged,
      };
      return replyData;
    } catch (err) {
      await dbTransactions.abort(dbsession);
      errors.wrapError(err);
    }
  },
};
