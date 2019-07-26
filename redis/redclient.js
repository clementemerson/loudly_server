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
    exists: async (keyName) => {
        if (!keyName)
            throw "Invalid Arguments";

        return await redClient.existsAsync(keyName);
    },
    sadd: async (setKey, value) => {
        if (!setKey || !value)
            throw "Invalid Arguments";

        return await redClient.saddAsync([setKey, value]);
    },
    srem: async (setKey, value) => {
        if (!setKey || !value)
            throw "Invalid Arguments";

        return await redClient.sremAsync([setKey, value]);
    },
    smembers: async (setKey) => {
        if (!setKey)
            throw "Invalid Arguments";

        return await redClient.smembersAsync(setKey);
    },
    lpush: async (listKey, value) => {
        if (!listKey || !value)
            throw "Invalid Arguments";

        return await redClient.lpushAsync(listKey, value);
    },
    hmset: async (hashKey, ...args) => {
        if (!hashKey)
            throw "Invalid Arguments";

        return await redClient.hmsetAsync(hashKey, args);
    },
    hincrby: async (hashKey, field, incrBy) => {
        if (!hashKey || !field || !incrBy)
            throw "Invalid Arguments";

        return await redClient.hincrbyAsync(hashKey, field, incrBy);
    },
    hgetall: async (hashKey) => {
        if (!hashKey)
            throw "Invalid Arguments";

        return await redClient.hgetallAsync(hashKey);
    },
    multiget: async (prefixKey, ids) => {
        if (!prefixKey || !ids)
            throw "Invalid Arguments";

        let multiCmd = redClient.multi({ pipeline: false });

        ids.forEach(async (id) => {
            multiCmd.hgetall(prefixKey + id);
        });

        return await multiCmd.execAsync();
    },
};


