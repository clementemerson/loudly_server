let connections = require('../websockets/connections');
var replyHelper = require('../helpers/replyhelper');

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
        //pop a pollid from pollupdates list from redis
        let pollid;
        do {
            pollid = await redClient.spop(keyPrefix.pollUpdates);
            // console.log('pollid: ', pollid);
            if (!pollid)
                break;

            //get poll result from redis
            const pollResult = await redHelper.getPollResult(pollid);
            // console.log('pollresult: ', pollResult);

            if (!pollResult) {
                //Todo: if pollresult is not in redis, update it by getting it from mongo.
            }

            //get the subscribed users for that poll from pollsub_pollid set from redis
            const subscribedUsers = await redHelper.getSubscribedUsers(pollid);
            // console.log('subscribedUsers: ', subscribedUsers);
            if (!!subscribedUsers) {
                subscribedUsers.forEach(user_id => {
                    // console.log(user_id);
                    const wsConn = connections.getConnections().get(user_id);
                    if (!!wsConn) {
                        let message = {
                            module: 'sync',
                            event: 'pollResult'
                        }
                        let reply = replyHelper.prepareSuccess(message, pollResult)
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
                    const user_id = privateFunctions.getAfterColon(updateKey);
                    const wsConn = connections.getConnections().get(parseInt(user_id));
                    if (!!wsConn) {
                        const groups = await redClient.smembers(updateKey);
                        let message = {
                            module: 'sync',
                            event: 'groupInfo'
                        }
                        let groupList = [];
                        groups.forEach(group => {
                            groupList.push(parseInt(group));
                        });
                        let reply = await replyHelper.prepareSuccess(message, groupList)
                        console.log('sending msg to ', user_id);
                        wsConn.send(JSON.stringify(reply));
                        redClient.del(updateKey);
                    }                    
                });
            }
        } while (cursor != 0)
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
            const result = await redClient.scan(cursor, keyPrefix.groupUserUpdate + '*');
            cursor = result[0];
            if (!!result[1]) {
                result[1].forEach(async (updateKey) => {
                    const user_id = privateFunctions.getAfterColon(updateKey);
                    const wsConn = connections.getConnections().get(parseInt(user_id));
                    if (!!wsConn) {
                        const groupUserChanges = await redClient.smembers(updateKey);       
                        let message = {
                            module: 'sync',
                            event: 'groupUserInfo'
                        }
                        let reply = await replyHelper.prepareSuccess(message, groupUserChanges)
                        wsConn.send(JSON.stringify(reply));
                        redClient.del(updateKey);
                    }                    
                });
            }
        } while (cursor != 0)
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
                    const user_id = privateFunctions.getUserIdFromPollUpdate(updateKey);
                    const wsConn = connections.getConnections().get(parseInt(user_id));
                    if (!!wsConn) {
                        const polls = await redClient.smembers(updateKey);
                        let pollList = [];
                        polls.forEach(poll => {
                            pollList.push(parseInt(poll));
                        });
                        let message = {
                            module: 'sync',
                            event: 'newPoll',
                            messageid: '1000'
                        }
                        let reply = await replyHelper.prepareSuccess(message, pollList)
                        wsConn.send(JSON.stringify(reply));
                        redClient.del(updateKey);
                    }                    
                });
            }
        } while (cursor != 0)
    },
}

privateFunctions = {
    getAfterColon: (str) => {
        return str.substr(str.indexOf(":") + 1);
    },
    getUserIdFromPollUpdate: (str) => {
        var startIndex = str.indexOf(":") + 1;
        var n2 = str.indexOf("_G");
        return str.substr(startIndex, n2 - startIndex);
    },
}