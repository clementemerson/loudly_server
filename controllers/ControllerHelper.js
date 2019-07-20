let connections = require('../websockets/connections');
let GroupUsers = require('../db/groupusers');

const redClient = require('../redis/redclient');

module.exports = {

    //Internal function
    informUsers: async (groupid, data) => {
        let groupUsers = await GroupUsers.getUsers(groupid);
        let usersFromRedis = await redClient.smembers('GroupUsers_' + groupid);
        usersFromRedis.forEach((user) => {

        })
        console.log(usersFromRedis);
        connections.inform(groupUsers, data);
    },
    informGroupUpdate: async (groupid) => {
        let usersFromRedis = await redClient.smembers('GroupUsers_' + groupid);
        usersFromRedis.forEach((userid) => {
            redClient.sadd('GroupUpdate_' + userid, groupid);
        })
    },
    informPollUpdate: async (pollid) => {
        let usersFromRedis = await redClient.smembers('PollVotedUsers_' + pollid);
        usersFromRedis.forEach((userid) => {
            redClient.sadd('PollUpdate_' + userid, pollid);
        })
    },

}