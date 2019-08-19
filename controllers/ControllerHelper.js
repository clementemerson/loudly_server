const redClient = require('../redis/redclient');
const keyPrefix = require('../redis/key_prefix');

const thirtyDaysInSeconds = 2592000;

module.exports = {

    /**
     * To update all users that the group's info has been changed.
     * These keys are being watched by the fanout process, and update
     * the users if they're online
     * Offline users will be updated once they come online.
     * This key will be expired in 30 days.
     * So offline users wont get notification through this method, if
     * they dont come online within 30 days.
     * 
     * @param {*} groupid
     */
    informGroupUpdate: async (groupid) => {
        console.log('ControllerHelper.informGroupUpdate');
        let usersFromRedis = await redClient.smembers(keyPrefix.usersOfGroup + groupid);
        usersFromRedis.forEach((userid) => {
            redClient.sadd(keyPrefix.groupUpdate + userid, groupid, thirtyDaysInSeconds);
        })
    },

    /**
     * To update all users that some user related data has been changed 
     * in the group.
     * These keys are being watched by the fanout process, and online users
     * will get a notification by the fanout process.
     * Offline users will be updated once they come online.
     * This key will be expired in 30 days.
     * So offline users wont get notification through this method, if
     * they dont come online within 30 days.
     *
     * @param {*} groupid
     * @param {*} data
     */
    informGroupUserUpdate: async (groupid, data) => {
        console.log('ControllerHelper.informGroupUserUpdate');
        let usersFromRedis = await redClient.smembers(keyPrefix.usersOfGroup + groupid);
        usersFromRedis.forEach((userid) => {
            redClient.sadd(keyPrefix.groupUserUpdate + userid, data, thirtyDaysInSeconds);
        })
    },

    /**
     * To notify users about a new poll in their group.
     * These keys are being watched by the fanout process, and online users
     * will get a notification by the fanout process.
     * Offline users will be updated once they come online.
     * This key will be expired in 30 days.
     * So offline users wont get notification through this method, if
     * they dont come online within 30 days.
     *
     * @param {*} groupid
     * @param {*} pollid
     */
    informNewPollInGroup: async (groupid, pollid) => {
        console.log('ControllerHelper.informNewPollInGroup');
        let usersFromRedis = await redClient.smembers(keyPrefix.usersOfGroup + groupid);
        usersFromRedis.forEach((userid) => {
            var key = keyPrefix.newGroupPoll.replace("{0}", userid).replace("{1}", groupid);
            redClient.sadd(key, pollid, thirtyDaysInSeconds);
        })
    }
}