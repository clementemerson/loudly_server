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
    sadd: async (setKey, value) => {
        return await redClient.saddAsync([setKey, value]);
    },
    srem: async (setKey, value) => {
        return await redClient.sremAsync([setKey, value]);
    },
    smembers: async (setKey) => {
        return await redClient.smembersAsync(setKey);
    },
    lpush: async (listKey, value) => {
        return await redClient.lpush(listKey, value);
    },
    hmset: async (hashKey, ...args) => {
        //console.log(redClient);
        return await redClient.hmsetAsync(hashKey, args);
    },
    hincrby: async (hashKey, field, incrBy) => {
        return await redClient.hincrbyAsync(hashKey, field, incrBy);
    },
    hgetall: async (hashKey) => {
        return await redClient.hgetallAsync(hashKey);
    },
    multiget: async (prefixKey, ids) => {
        let multiCmd = redClient.multi({pipeline: false});

        ids.forEach(async (id) => {
            multiCmd.hgetall(prefixKey + id);
        });

        return await multiCmd.execAsync();
    },
};


