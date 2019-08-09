let connections = require('../websockets/connections');
let GroupUsers = require('../db/groupusers');

const redClient = require('../redis/redclient');
const keyPrefix = require('../redis/key_prefix');

module.exports = {

    //Internal function
    informGroupUpdate: async (groupid) => {
        let usersFromRedis = await redClient.smembers(keyPrefix.groupUsers + groupid);
        usersFromRedis.forEach((userid) => {
            redClient.sadd(keyPrefix.groupUpdate + userid, groupid);
        })
    },
    informGroupUserUpdate: async (groupid) => {
        let usersFromRedis = await redClient.smembers(keyPrefix.groupUsers + groupid);
        usersFromRedis.forEach((userid) => {
            redClient.sadd(keyPrefix.groupUserUpdate + userid, groupid);
        })
    },
    informNewPollInGroup: async (groupid, pollid) => {
        let usersFromRedis = await redClient.smembers(keyPrefix.groupUsers + groupid);
        usersFromRedis.forEach((userid) => {
            redClient.sadd(keyPrefix.newGroupPoll + userid, groupid);
        })
    }

}