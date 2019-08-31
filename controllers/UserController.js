const Users = require('../db/users');
const dbTransactions = require('../db/session');

const errors = require('../helpers/errorstousers');
const success = require('../helpers/successtousers');
const replyHelper = require('../helpers/replyhelper');
const GroupUsers = require('../db/groupusers');
const UserPolls = require('../db/userpolls');

const redHelper = require('../redis/redhelper');

module.exports = {
  getUsersByPhoneNumbers: async (req, res) => {
    console.log('UserController.getUsersByPhoneNumbers');
    const phoneNumbers = req.body.phoneNumbers;

    const users = await Users.getUsersByPhoneNumbers(phoneNumbers);
    const userIds = [];
    users.forEach((oneUser) => {
      userIds.push(oneUser.user_id);
    });

    const userinfos = await Users.getUserInfoByUserIds(userIds);
    res.status(200).send({userslist: userinfos});
  },

  /**
     * Get userinfo from their phonenumbers
     *
     * Tested on: 17-Aug-2019
     * {"module":"users", "event":"getUsersFromPhoneNumbers", "messageid":3432,
     *  "data": {"phoneNumbers":["+919884386484"]}}
     *
     * @param {*} message
     * @returns
     */
  getUsersFromPhoneNumbers: async (message) => {
    console.log('UserController.getUsersFromPhoneNumbers');
    if (!message.user_id || !message.data || !message.data.phoneNumbers) {
      return await replyHelper.prepareError(message, null, errors.invalidData);
    }

    try {
      const users =
        await redHelper.getUserIdsByPhone(message.data.phoneNumbers);

      const userIds = [];
      users.forEach((oneUser) => {
        userIds.push(parseInt(oneUser.id));
      });

      const userinfos = await Users.getUserInfoByUserIds(userIds);
      return await replyHelper.prepareSuccess(message, userinfos);
    } catch (err) {
      console.log(err);
      return await replyHelper.prepareError(message, null, errors.unknownError);
    }
  },

  /**
     * Get user's group. One time usage, when user is logging in.
     *
     * Tested on: 17-Aug-2019
     * {"module":"users", "event":"getGroups", "messageid":4641}
     *
     * @param {*} message
     * @returns
     */
  getGroups: async (message) => {
    console.log('UserController.getGroups');
    if (!message.user_id) {
      return await replyHelper.prepareError(message, null, errors.invalidData);
    }

    try {
      const groups = await GroupUsers.getGroupsOfUser(message.user_id);
      return await replyHelper.prepareSuccess(message, groups);
    } catch (err) {
      console.log(err);
      return await replyHelper.prepareError(message, null, errors.unknownError);
    }
  },

  /**
     * To get user created polls. One time usage, when user is logging in.
     *
     * Tested on: 17-Aug-2019
     * {"module":"users", "event":"getPolls", "messageid":4641}
     *
     * @param {*} message
     * @returns
     */
  getPolls: async (message) => {
    console.log('UserController.getPolls');
    if (!message.user_id) {
      return await replyHelper.prepareError(message, null, errors.invalidData);
    }

    try {
      const polls = await UserPolls.getPolls(message.user_id);
      return await replyHelper.prepareSuccess(message, polls);
    } catch (err) {
      console.log(err);
      return await replyHelper.prepareError(message, null, errors.unknownError);
    }
  },

  /**
     * To get userinfo for the given userids.
     *
     * Tested on: 17-Aug-2019
     * {"module":"users", "event":"getInfo", "messageid":9961, "
     *  data":{"userids":[2000,2001]}}
     *
     * @param {*} message
     * @returns
     */
  getInfo: async (message) => {
    console.log('UserController.getInfo');
    if (!message.user_id || !message.data || !message.data.userids) {
      return await replyHelper.prepareError(message, null, errors.invalidData);
    }

    try {
      const userinfos = await Users.getUserInfoByUserIds(message.data.userids);
      return await replyHelper.prepareSuccess(message, userinfos);
    } catch (err) {
      console.log(err);
      return await replyHelper.prepareError(message, null, errors.unknownError);
    }
  },

  /**
     * To change one's display name.
     *
     * Tested on: 17-Aug-2019
     * {"module":"users", "event":"changeName", "messageid":2154,
     *  "data":{"name":"Clement"}}
     *
     * @param {*} message
     * @returns
     */
  changeName: async (message) => {
    console.log('UserController.changeName');
    if (!message.user_id || !message.data || !message.data.name) {
      return await replyHelper.prepareError(message, null, errors.invalidData);
    }

    let dbsession;
    try {
      // Start transaction
      dbsession = await dbTransactions.startSession();

      // Prepare data
      const data = {
        user_id: message.user_id,
        name: message.data.name,
      };

      // Change the name
      await Users.changeName(data);
      await dbTransactions.commitTransaction(dbsession);

      const replyData = {
        status: success.userNameChanged,
      };
      return await replyHelper.prepareSuccess(message, replyData);
    } catch (err) {
      console.log(err);
      return await replyHelper.prepareError(message,
          dbsession, errors.unknownError);
    }
  },

  /**
     * To change one's status message
     *
     * Tested on: 17-Aug-2019
     * {"module":"users", "event":"changeStatusMsg", "messageid":4641,
     *  "data":{"statusmsg":"some status"}}
     *
     * @param {*} message
     * @returns
     */
  changeStatusMsg: async (message) => {
    console.log('UserController.changeStatusMsg');
    if (!message.user_id || !message.data || !message.data.statusmsg) {
      return await replyHelper.prepareError(message, null, errors.invalidData);
    }

    let dbsession;
    try {
      // Start transaction
      dbsession = await dbTransactions.startSession();

      // Prepare data
      const data = {
        user_id: message.user_id,
        statusmsg: message.data.statusmsg,
      };

      // Change the name
      await Users.changeStatusMsg(data);
      await dbTransactions.commitTransaction(dbsession);

      const replyData = {
        status: success.userStatusChanged,
      };
      return await replyHelper.prepareSuccess(message, replyData);
    } catch (err) {
      console.log(err);
      return await replyHelper.prepareError(message,
          dbsession, errors.unknownError);
    }
  },
};
