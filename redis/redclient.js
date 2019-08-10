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
    //-----------------------------------------------------------------//
    //      COMMON FUNCTIONS
    //-----------------------------------------------------------------//
    exists: async (keyName) => {
        if (!keyName)
            throw "Invalid Arguments";

        return await redClient.existsAsync(keyName);
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
    //-----------------------------------------------------------------//
    //      UNSORTED SET FUNCTIONS
    //-----------------------------------------------------------------//
    sadd: async (setKey, value, expirySecs) => {
        if (!setKey || !value)
            throw "Invalid Arguments";

        if(!!expirySecs) {
            const exists = await redClient.existsAsync(setKey);
            if(exists == false) {
                const saddReturn = await redClient.saddAsync([setKey, value]);
                await redClient.expire(setKey, expirySecs);
                return saddReturn;
            }
        }

        return await redClient.saddAsync([setKey, value]);
    },
    srem: async (setKey, value) => {
        if (!setKey || !value)
            throw "Invalid Arguments";

        return await redClient.sremAsync([setKey, value]);
    },
    spop: async (setKey) => {
        if (!setKey)
            throw "Invalid Arguments";

        return await redClient.spop(setKey);
    },
    smembers: async (setKey) => {
        if (!setKey)
            throw "Invalid Arguments";

        return await redClient.smembersAsync(setKey);
    },
    //-----------------------------------------------------------------//
    //      SORTED SET FUNCTIONS
    //-----------------------------------------------------------------//
    zadd: async (setKey, value, score) => {
        if (!setKey || !value || !score)
            throw "Invalid Arguments";

        return await redClient.zaddAsync(setKey, score, value);
    },
    zrem: async (setKey, value) => {
        if (!setKey || !value)
            throw "Invalid Arguments";

        return await redClient.zremAsync(setKey, value);
    },
    zrangebyscore: async(setKey, scoreMin, scoreMax) => {
        if (!setKey || !scoreMin || !scoreMax)
            throw "Invalid Arguments";

        return await redClient.zrangebyscoreAsync(setKey, scoreMin, scoreMax);
    },
    zremrangebyscore: async(setKey, scoreMin, scoreMax) => {
        if (!setKey || !scoreMin || !scoreMax)
            throw "Invalid Arguments";

        return await redClient.zremrangebyscoreAsync(setKey, scoreMin, scoreMax);
    },
    //-----------------------------------------------------------------//
    //      LIST FUNCTIONS
    //-----------------------------------------------------------------//
    lpush: async (listKey, value) => {
        if (!listKey || !value)
            throw "Invalid Arguments";

        return await redClient.lpushAsync(listKey, value);
    },
    //-----------------------------------------------------------------//
    //      HASH FUNCTIONS
    //-----------------------------------------------------------------//
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
};