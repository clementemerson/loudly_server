let connections = require('../websockets/connections');
var replyHelper = require('../helpers/replyhelper');

const redClient = require('../redis/redclient');
const keyPrefix = require('../redis/key_prefix');
const redHelper = require('../redis/redhelper');

module.exports = {

    sendPollUpdates: async () => {
        console.log('UpdateController.sendPollUpdates');
        //pop a pollid from pollupdates list from redis
        let pollid;
        do {
            pollid = await redClient.spop(keyPrefix.pollUpdates);
            console.log('pollid: ', pollid);
            if (!pollid)
                break;

            //get poll result from redis
            const pollResult = await redHelper.getPollResult(pollid);
            console.log('pollresult: ', pollResult);

            if (!pollResult) {
                //Todo: if pollresult is not in redis, update it by getting it from mongo.
            }

            //get the subscribed users for that poll from pollsub_pollid set from redis
            const subscribedUsers = await redHelper.getSubscribedUsers(pollid);
            console.log('subscribedUsers: ', subscribedUsers);
            if (!!subscribedUsers) {
                subscribedUsers.forEach(user_id => {
                    console.log(user_id);
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

    sendGroupUpdate: async () => {
        console.log('UpdateController.sendGroupUpdate');

        let cursor = 0;
        do {
            const result = await redClient.scan(cursor, keyPrefix.groupUpdate + '*');
            cursor = result[0];
            if (!!result[1]) {
                result[1].forEach(async (updateKey) => {
                    const user_id = privateFunctions.getAfterColon(updateKey);
                    const wsConn = connections.getConnections().get(user_id);
                    if (!!wsConn) {
                        const groups = await redClient.smembers(updateKey);
                        let message = {
                            module: 'sync',
                            event: 'groupInfo'
                        }
                        let reply = replyHelper.prepareSuccess(message, groups)
                        wsConn.send(JSON.stringify(reply));
                        redClient.del(updateKey);
                    }                    
                });
            }
        } while (cursor != 0)
    },
    sendGroupUserUpdate: async () => {
        console.log('UpdateController.sendGroupUserUpdate');

        let cursor = 0;
        do {
            const result = await redClient.scan(cursor, keyPrefix.groupUserUpdate + '*');
            cursor = result[0];
            if (!!result[1]) {
                result[1].forEach(async (updateKey) => {
                    const user_id = privateFunctions.getAfterColon(updateKey);
                    const wsConn = connections.getConnections().get(user_id);
                    if (!!wsConn) {
                        const groups = await redClient.smembers(updateKey);                        
                        let message = {
                            module: 'sync',
                            event: 'groupUserInfo'
                        }
                        let reply = replyHelper.prepareSuccess(message, groups)
                        wsConn.send(JSON.stringify(reply));
                        redClient.del(updateKey);
                    }                    
                });
            }
        } while (cursor != 0)
    },
    sendGroupPollUpdate: async () => {
        console.log('UpdateController.sendGroupPollUpdate');

        let cursor = 0;
        do {
            const result = await redClient.scan(cursor, 'nPU:*');
            cursor = result[0];
            if (!!result[1]) {
                result[1].forEach(async (updateKey) => {
                    const user_id = privateFunctions.getUserIdFromPollUpdate(updateKey);
                    const wsConn = connections.getConnections().get(user_id);
                    if (!!wsConn) {
                        const polls = await redClient.smembers(updateKey);
                        let message = {
                            module: 'sync',
                            event: 'newPoll'
                        }
                        let reply = replyHelper.prepareSuccess(message, polls)
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