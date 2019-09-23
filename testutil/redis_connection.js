const redis = require('redis');
const bluebird = require('bluebird');
bluebird.promisifyAll(redis);

const password = 'jbhfjahfje8243752bdsaBHFJ754KJGNJGDF8673BJGgijuhgjihuuit';

module.exports = {
    initTestRedis: async () => {
        return new Promise((resolve, reject) => {
            try {
                const red = redis.createClient(6379, 'loudly.loudspeakerdev.net', { db: 5 });
                red.on('connect', function () {
                    red.auth(password, () => {
                        resolve(red);
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
    }
}