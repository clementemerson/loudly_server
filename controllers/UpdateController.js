let connections = require('../websockets/connections');

const redClient = require('../redis/redclient');
const keyPrefix = require('../redis/key_prefix');
const redHelper = require('../redis/redhelper');

module.exports = {

    sendPollUpdates: async () => {
        //pop a pollid from pollupdates list from redis
        do {
            const pollid = await redClient.spop(keyPrefix.pollUpdates);
            if (!pollid)
                break;

            //get poll result from redis
            const pollResult = await redHelper.getPollResult(pollid);
            console.log(pollResult);

            //Todo: if pollresult is not in redis, update it by getting it from mongo.

            //get the subscribed users for that poll from pollsub_pollid set from redis
            const subscribedUsers = await redHelper.getSubscribedUsers(pollid);
            subscribedUsers.forEach(user_id => {
                const wsConn = connections.getConnections().get(user_id);
                if (!wsConn)
                    continue;

                wsConn.send(JSON.stringify(pollResult));
            });
        } while (!!pollid);
    }

}