const redClient = require('../redis/redclient');
const keyPrefix = require('../redis/key_prefix');

const thirtyDaysInSeconds = 2592000;

module.exports = {

    //Internal function
    informGroupUpdate: async (groupid) => {
        let usersFromRedis = await redClient.smembers(keyPrefix.usersOfGroup + groupid);
        usersFromRedis.forEach((userid) => {
            redClient.sadd(keyPrefix.groupUpdate + userid, groupid, thirtyDaysInSeconds);
        })
    },
    informGroupUserUpdate: async (groupid, data) => {
        let usersFromRedis = await redClient.smembers(keyPrefix.usersOfGroup + groupid);
        usersFromRedis.forEach((userid) => {
            redClient.sadd(keyPrefix.groupUserUpdate + userid, data, thirtyDaysInSeconds);
        })
    },
    informNewPollInGroup: async (groupid, pollid) => {
        let usersFromRedis = await redClient.smembers(keyPrefix.usersOfGroup + groupid);
        usersFromRedis.forEach((userid) => {
            redClient.sadd(keyPrefix.newGroupPoll.format(userid, groupid), pollid, thirtyDaysInSeconds);
        })
    }

}