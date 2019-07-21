let connections = require('../websockets/connections');
let GroupUsers = require('../db/groupusers');

const redClient = require('../redis/redclient');
const keyPrefix = require('../redis/key_prefix');

module.exports = {

    //Internal function
    informUsers: async (groupid, data) => {
        let groupUsers = await GroupUsers.getUsers(groupid);
        connections.inform(groupUsers, data);
    },
    informGroupUpdate: async (groupid) => {
        let usersFromRedis = await redClient.smembers(keyPrefix.groupUsers + groupid);
        usersFromRedis.forEach((userid) => {
            redClient.sadd(keyPrefix.groupUpdate + userid, groupid);
        })
    },
    informPollUpdate: async (pollid) => {
        let usersFromRedis = await redClient.smembers(keyPrefix.pollVotedUsers + pollid);
        usersFromRedis.forEach((userid) => {
            redClient.sadd(keyPrefix.pollUpdate + userid, pollid);
        })
    },

}