//mongo
const redis = require('redis');
const bluebird = require('bluebird');

bluebird.promisifyAll(redis);
var redClient;

module.exports = {
    initRedisClient: async (callback) => {
        try {
            redClient = redis.createClient(6379, 'loudly.loudspeakerdev.net');
            redClient.on('connect', function () {
                console.log('Redis client connected');
                callback();
            });

            redClient.on('error', function (err) {
                console.log('Something went wrong ' + err);
            });

        } catch (err) {
            console.log(err);
        }
    },
    sadd: async (setname, value) => {
        return await redClient.saddAsync([setname, value]);
    },
    srem: async (setname, value) => {
        return await redClient.sremAsync([setname, value]);
    },
    smembers: async (setname) => {
        return await redClient.smembersAsync(setname);
    },
    lpush: async (listKey, value) => {
        return await redClient.lpush(listKey, value);
    },
};


