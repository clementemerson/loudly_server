const connections = require('../websockets/connections');
const replyHelper = require('../helpers/replyhelper');

const redClient = require('../redis/redclient');
const keyPrefix = require('../redis/key_prefix');
const redHelper = require('../redis/redhelper');

module.exports = {
  /**
   * To send pollresult updates to the subscribed users.
   *
   * Tested on: Pending
   *
   */
  sendPollUpdates: async () => {
    // pop a pollid from pollupdates list from redis
    let pollid;
    do {
      pollid = await redClient.spop(keyPrefix.pollUpdates);
      // console.log('pollid: ', pollid);
      if (!pollid) {
        break;
      }

      // get poll result from redis
      const pollResult = await redHelper.getPollResult(pollid);
      // console.log('pollresult: ', pollResult);

      if (!pollResult) {
        // Todo: if pollresult is not in redis,
        // update it by getting it from mongo.
      }

      // get the subscribed users for that poll from pollsub_pollid
      //  set from redis
      const subscribedUsers = await redHelper.getSubscribedUsers(pollid);
      // console.log('subscribedUsers: ', subscribedUsers);
      if (!!subscribedUsers) {
        subscribedUsers.forEach((userId) => {
          // console.log(user_id);
          const wsConn = connections.getConnections().get(userId);
          if (!!wsConn) {
            const message = {
              module: 'sync',
              event: 'pollResult',
            };
            const reply = replyHelper.prepareSuccess(message, pollResult);
            wsConn.send(JSON.stringify(reply));
          }
        });
      }
    } while (!!pollid);
  },

  /**
   * To send groupinfo updates to the online users
   *
   * Tested on: 19-Aug-2019
   *
   */
  sendGroupUpdate: async () => {
    let cursor = 0;
    do {
      const result = await redClient.scan(cursor, keyPrefix.groupUpdate + '*');
      cursor = result[0];
      if (!!result[1]) {
        result[1].forEach(async (updateKey) => {
          const userId = privateFunctions.getAfterColon(updateKey);
          const wsConn = connections.getConnections().get(parseInt(userId));
          if (!!wsConn) {
            const groups = await redClient.smembers(updateKey);
            const message = {
              module: 'sync',
              event: 'groupInfo',
            };
            const groupList = [];
            groups.forEach((group) => {
              groupList.push(parseInt(group));
            });
            const reply = await replyHelper.prepareSuccess(message, groupList);
            console.log('sending msg to ', userId);
            wsConn.send(JSON.stringify(reply));
            redClient.del(updateKey);
          }
        });
      }
    } while (cursor != 0);
  },

  /**
   * To send groupuser related updates to the online users.
   *
   * Tested on: 19-Aug-2019
   *
   */
  sendGroupUserUpdate: async () => {
    let cursor = 0;
    do {
      const result = await redClient.scan(
          cursor,
          keyPrefix.groupUserUpdate + '*'
      );
      cursor = result[0];
      if (!!result[1]) {
        result[1].forEach(async (updateKey) => {
          const userId = privateFunctions.getAfterColon(updateKey);
          const wsConn = connections.getConnections().get(parseInt(userId));
          if (!!wsConn) {
            const groupUserChanges = await redClient.smembers(updateKey);
            const message = {
              module: 'sync',
              event: 'groupUserInfo',
            };
            const reply = await replyHelper.prepareSuccess(
                message,
                groupUserChanges
            );
            wsConn.send(JSON.stringify(reply));
            redClient.del(updateKey);
          }
        });
      }
    } while (cursor != 0);
  },

  /**
   * To send newpoll added to the group
   *
   * Tested on: 19-Aug-2019
   *
   */
  sendGroupPollUpdate: async () => {
    let cursor = 0;
    do {
      const result = await redClient.scan(cursor, 'nPU:*');
      cursor = result[0];
      if (!!result[1]) {
        result[1].forEach(async (updateKey) => {
          const userId = privateFunctions.getUserIdFromPollUpdate(updateKey);
          const wsConn = connections.getConnections().get(parseInt(userId));
          if (!!wsConn) {
            const polls = await redClient.smembers(updateKey);
            const pollList = [];
            polls.forEach((poll) => {
              pollList.push(parseInt(poll));
            });
            const message = {
              module: 'sync',
              event: 'newPoll',
              messageid: '1000',
            };
            const reply = await replyHelper.prepareSuccess(message, pollList);
            wsConn.send(JSON.stringify(reply));
            redClient.del(updateKey);
          }
        });
      }
    } while (cursor != 0);
  },
};

privateFunctions = {
  getAfterColon: (str) => {
    return str.substr(str.indexOf(':') + 1);
  },
  getUserIdFromPollUpdate: (str) => {
    const startIndex = str.indexOf(':') + 1;
    const n2 = str.indexOf('_G');
    return str.substr(startIndex, n2 - startIndex);
  },
};
