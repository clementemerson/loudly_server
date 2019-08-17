const redClient = require('../redis/redclient');
const keyPrefix = require('../redis/key_prefix');

const thirtyDaysInSeconds = 2592000;

module.exports = {

    //Internal function
    informGroupUpdate: async (groupid) => {
        console.log('ControllerHelper.informGroupUpdate');
        let usersFromRedis = await redClient.smembers(keyPrefix.usersOfGroup + groupid);
        usersFromRedis.forEach((userid) => {
            redClient.sadd(keyPrefix.groupUpdate + userid, groupid, thirtyDaysInSeconds);
        })
    },
    informGroupUserUpdate: async (groupid, data) => {
        console.log('ControllerHelper.informGroupUserUpdate');
        let usersFromRedis = await redClient.smembers(keyPrefix.usersOfGroup + groupid);
        usersFromRedis.forEach((userid) => {
            redClient.sadd(keyPrefix.groupUserUpdate + userid, data, thirtyDaysInSeconds);
        })
    },
    informNewPollInGroup: async (groupid, pollid) => {
        console.log('ControllerHelper.informNewPollInGroup');
        let usersFromRedis = await redClient.smembers(keyPrefix.usersOfGroup + groupid);
        usersFromRedis.forEach((userid) => {
            var key = keyPrefix.newGroupPoll.replace("{0}", userid).replace("{1}", groupid);
            redClient.sadd(key, pollid, thirtyDaysInSeconds);
        })
    }

}