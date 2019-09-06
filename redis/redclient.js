// mongo
const redis = require('redis');
const bluebird = require('bluebird');
const password = 'jbhfjahfje8243752bdsaBHFJ754KJGNJGDF8673BJGgijuhgjihuuit';

bluebird.promisifyAll(redis);
let redClient;

module.exports = {
  initRedisClient: async () => {
    return new Promise((resolve, reject) => {
      try {
        redClient = redis.createClient(6379, 'loudly.loudspeakerdev.net');
        redClient.on('connect', function() {
          redClient.auth(password, () => {
            resolve();
          });
        });

        redClient.on('error', function(err) {
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
  exists: async (keyName) => {
    if (!keyName) {
      throw new Error('Invalid Arguments');
    }

    return await redClient.existsAsync(keyName);
  },
  multiget: async (prefixKey, ids) => {
    if (!prefixKey || !ids) {
      throw new Error('Invalid Arguments');
    }

    const multiCmd = redClient.multi({pipeline: false});

    ids.forEach(async (id) => {
      multiCmd.hgetall(prefixKey + id);
    });

    return await multiCmd.execAsync();
  },
  scan: async (cursor, match) => {
    if (!match) {
      throw new Error('Invalid Arguments');
    }

    return await redClient.scanAsync(cursor, 'MATCH', match);
  },
  del: async (key) => {
    if (!key) {
      throw new Error('Invalid Arguments');
    }

    return await redClient.delAsync(key);
  },
  // -----------------------------------------------------------------//
  //      UNSORTED SET FUNCTIONS
  // -----------------------------------------------------------------//
  sadd: async (setKey, value, expirySecs) => {
    if (!setKey || !value) {
      throw new Error('Invalid Arguments');
    }

    if (!!expirySecs) {
      const exists = await redClient.existsAsync(setKey);
      if (exists == false) {
        const saddReturn = await redClient.saddAsync([setKey, value]);
        await redClient.expire(setKey, expirySecs);
        return saddReturn;
      }
    }

    return await redClient.saddAsync([setKey, value]);
  },
  srem: async (setKey, value) => {
    if (!setKey || !value) {
      throw new Error('Invalid Arguments');
    }

    return await redClient.sremAsync([setKey, value]);
  },
  spop: async (setKey) => {
    if (!setKey) {
      throw new Error('Invalid Arguments');
    }

    return await redClient.spopAsync(setKey);
  },
  smembers: async (setKey) => {
    if (!setKey) {
      throw new Error('Invalid Arguments');
    }

    return await redClient.smembersAsync(setKey);
  },
  sismember: async (setKey, value) => {
    if (!setKey || !value) {
      throw new Error('Invalid Arguments');
    }

    return await redClient.sismemberAsync(setKey, value);
  },
  // -----------------------------------------------------------------//
  //      SORTED SET FUNCTIONS
  // -----------------------------------------------------------------//
  zadd: async (setKey, value, score) => {
    if (!setKey || !value || !score) {
      throw new Error('Invalid Arguments');
    }

    return await redClient.zaddAsync(setKey, score, value);
  },
  zrem: async (setKey, value) => {
    if (!setKey || !value) {
      throw new Error('Invalid Arguments');
    }

    return await redClient.zremAsync(setKey, value);
  },
  zrangebyscore: async (setKey, scoreMin, scoreMax) => {
    if (!setKey || !scoreMin || !scoreMax) {
      throw new Error('Invalid Arguments');
    }

    return await redClient.zrangebyscoreAsync(setKey, scoreMin, scoreMax);
  },
  zremrangebyscore: async (setKey, scoreMin, scoreMax) => {
    if (!setKey || !scoreMin || !scoreMax) {
      throw new Error('Invalid Arguments');
    }

    return await redClient.zremrangebyscoreAsync(setKey, scoreMin, scoreMax);
  },
  // -----------------------------------------------------------------//
  //      LIST FUNCTIONS
  // -----------------------------------------------------------------//
  lpush: async (listKey, value) => {
    if (!listKey || !value) {
      throw new Error('Invalid Arguments');
    }

    return await redClient.lpushAsync(listKey, value);
  },
  // -----------------------------------------------------------------//
  //      HASH FUNCTIONS
  // -----------------------------------------------------------------//
  hmset: async (hashKey, ...args) => {
    if (!hashKey) {
      throw new Error('Invalid Arguments');
    }

    return await redClient.hmsetAsync(hashKey, args);
  },
  hincrby: async (hashKey, field, incrBy) => {
    if (!hashKey || !field || !incrBy) {
      throw new Error('Invalid Arguments');
    }

    return await redClient.hincrbyAsync(hashKey, field, incrBy);
  },
  hgetall: async (hashKey) => {
    if (!hashKey) {
      throw new Error('Invalid Arguments');
    }

    return await redClient.hgetallAsync(hashKey);
  },
};


