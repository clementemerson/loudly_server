//mongo
const redis = require('redis');
var redClient;

module.exports = {
    initRedisClient: async (callback) => {
        try {
            redClient = redis.createClient(6379, 'loudly.loudspeakerdev.net');
            redClient.on('connect', function() {
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
    SADD: async (setname, member) => {
        redClient.sadd([setname, member], function (err, reply) {
            console.log(reply);
        });
    },
    SREM: async (setname, member) => {
        redClient.srem([setname, member], function (err, reply) {
            console.log(reply);
        });
    },
    SMEMBERS: async (setname) => {
        console.log(setname);
        redClient.smembers(setname, function (err, reply) {
            console.log(reply);
        });
        let replies = await redClient.smembers(setname);
        console.log(replies);
    }
};


