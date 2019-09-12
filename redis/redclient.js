const VError = require('verror');
const assert = require('assert');
const check = require('check-types');

const redis = require('redis');
const bluebird = require('bluebird');
const password = 'jbhfjahfje8243752bdsaBHFJ754KJGNJGDF8673BJGgijuhgjihuuit';

bluebird.promisifyAll(redis);
let red;

module.exports = {
    initRedisClient: async (host, port, db) => {
        return new Promise((resolve, reject) => {
            try {
                red = redis.createClient(port, host, { db: db });
                red.on('connect', function () {
                    red.auth(password, () => {
                        resolve();
                    });
                });

                red.on('error', function (err) {
                    console.log('Something went wrong ' + err);
                });
            } catch (err) {
                console.log(err);
                reject(err);
            }
        });
    },
    // -----------------------------------------------------------------//
    //      COMMON FUNCTIONS
    // -----------------------------------------------------------------//
    exists: async (key) => {
        if (check.string(key) === false) {
            throw new VError('argument \'key\' must be a string');
        }

        return await red.existsAsync(key);
    },
    multiget: async (keyPrefix, ids) => {
        if (check.string(keyPrefix) === false)
            throw new VError('argument \'keyPrefix\' must be a string');
        if (check.array.of.nonEmptyString(ids) === false)
            throw new VError('argument \'ids\' must be a nonEmptyString[]');

        const multiCmd = red.multi({ pipeline: false });

        ids.forEach(async (id) => {
            multiCmd.hgetall(keyPrefix + id);
        });

        return await multiCmd.execAsync();
    },
    scan: async (cursor, keyMatch) => {
        if (check.number(cursor) === false)
            throw new VError('argument \'cursor\' must be a number');
        if (check.string(keyMatch) === false)
            throw new VError('argument \'keyMatch\' must be a string');

        return await red.scanAsync(cursor, 'MATCH', match);
    },
    del: async (key) => {
        if (check.string(key) === false) {
            throw new VError('argument \'key\' must be a string');
        }

        return await red.delAsync(key);
    },
    // -----------------------------------------------------------------//
    //      UNSORTED SET FUNCTIONS
    // -----------------------------------------------------------------//
    sadd: async (key, value, expirySecs = null) => {
        if (check.string(key) === false)
            throw new VError('argument \'key\' must be a string');
        if (check.assigned(value) === false)
            throw new VError('argument \'value\' must be a defined');
        if (check.null(expirySecs) === false && check.number(expirySecs) === false)
            throw new VError('argument \'expirySecs\' must be null or a number');

        if (!!expirySecs) {
            const exists = await red.existsAsync(key);
            if (exists == false) {
                const saddReturn = await red.saddAsync([key, value]);
                await red.expireAsync(key, expirySecs);
                return saddReturn;
            }
        }

        return await red.saddAsync([key, value]);
    },
    srem: async (key, value) => {
        if (check.string(key) === false)
            throw new VError('argument \'key\' must be a string');
        if (check.assigned(value) === false)
            throw new VError('argument \'value\' must be a defined');

        return await red.sremAsync([key, value]);
    },
    spop: async (key) => {
        if (check.string(key) === false)
            throw new VError('argument \'key\' must be a string');

        return await red.spopAsync(key);
    },
    smembers: async (key) => {
        if (check.string(key) === false)
            throw new VError('argument \'key\' must be a string');

        return await red.smembersAsync(key);
    },
    sismember: async (key, value) => {
        if (check.string(key) === false)
            throw new VError('argument \'key\' must be a string');
        if (check.assigned(value) === false)
            throw new VError('argument \'value\' must be a defined');

        return await red.sismemberAsync(key, value);
    },
    // -----------------------------------------------------------------//
    //      SORTED SET FUNCTIONS
    // -----------------------------------------------------------------//
    zadd: async (key, value, score) => {
        if (check.string(key) === false)
            throw new VError('argument \'key\' must be a string');
        if (check.assigned(value) === false)
            throw new VError('argument \'value\' must be a defined');
        if (check.number(score) === false)
            throw new VError('argument \'score\' must be a number');

        return await red.zaddAsync(key, score, value);
    },
    zrem: async (key, value) => {
        if (check.string(key) === false)
            throw new VError('argument \'key\' must be a string');
        if (check.assigned(value) === false)
            throw new VError('argument \'value\' must be a defined');

        return await red.zremAsync(key, value);
    },
    zrangebyscore: async (key, scoreMin, scoreMax) => {
        if (check.string(key) === false)
            throw new VError('argument \'key\' must be a string');
        if (check.string(scoreMin) === false &&
            check.number(scoreMin) === false)
            throw new VError('argument \'scoreMin\' must be a number or string');
        if (check.string(scoreMax) === false &&
            check.number(scoreMax) === false)
            throw new VError('argument \'scoreMax\' must be a number or string');

        return await red.zrangebyscoreAsync(key, scoreMin, scoreMax);
    },
    zremrangebyscore: async (key, scoreMin, scoreMax) => {
        if (check.string(key) === false)
            throw new VError('argument \'key\' must be a string');
        if (check.string(scoreMin) === false &&
            check.number(scoreMin) === false)
            throw new VError('argument \'scoreMin\' must be a number or string');
        if (check.string(scoreMax) === false &&
            check.number(scoreMax) === false)
            throw new VError('argument \'scoreMax\' must be a number or string');

        return await red.zremrangebyscoreAsync(key, scoreMin, scoreMax);
    },
    // -----------------------------------------------------------------//
    //      LIST FUNCTIONS
    // -----------------------------------------------------------------//
    lpush: async (key, value) => {
        if (check.string(key) === false)
            throw new VError('argument \'key\' must be a string');
        if (check.assigned(value) === false)
            throw new VError('argument \'value\' must be a defined');

        return await red.lpushAsync(key, value);
    },
    // -----------------------------------------------------------------//
    //      HASH FUNCTIONS
    // -----------------------------------------------------------------//
    hmset: async (key, ...args) => {
        if (check.string(key) === false)
            throw new VError('argument \'key\' must be a string');

        return await red.hmsetAsync(key, args);
    },
    hincrby: async (key, field, incrBy) => {
        if (check.string(key) === false)
            throw new VError('argument \'key\' must be a string');
        if (check.string(field) === false)
            throw new VError('argument \'field\' must be a string');
        if (check.number(incrBy) === false)
            throw new VError('argument \'incrBy\' must be a number');

        return await red.hincrbyAsync(key, field, incrBy);
    },
    hgetall: async (key) => {
        if (check.string(key) === false)
            throw new VError('argument \'key\' must be a string');

        return await red.hgetallAsync(key);
    },
};
