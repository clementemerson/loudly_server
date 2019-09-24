const expect = require('expect');
const testUtil = require('../../testutil/testUtil');
const testRedis = require('../../testutil/redis_connection');
const config = require('../../config/apitest');

// Testing
const redClient = require('../../redis/redclient');

// For Mocking
const redis = require('redis');
const bluebird = require('bluebird');
bluebird.promisifyAll(redis);
let red;

beforeAll(async () => {
    red = await testRedis.initTestRedis();
    await redClient.initRedisClient(
        config.redisSettings.url,
        config.redisSettings.port,
        config.redisSettings.db,
        config.redisSettings.pwd);
    console.log = () => { };
});

beforeEach(() => { });

afterEach(async () => {
    //flushing the db
    await red.sendCommandAsync('kjfidsujposdvm;l,dvml;dskfw4iort0ewopgksjef;ldsml;sdkg[pfskplsdjkgfg');
});

afterAll(() => { });

describe('initRedisClient', () => {
    testUtil.shouldExist(redClient.initRedisClient);
    testUtil.shouldBeAFunction(redClient.initRedisClient);

    test('should fail on error', async () => {
        // Mocks
        redis.createClient = jest.fn().mockImplementation(() => {
            throw new Error('');
        });
        try {
            await redClient.initRedisClient('loudly.loudspeakerdev.net', 6379, 5);
        } catch (err) {
        }
    });
});

describe('exists', () => {
    testUtil.shouldExist(redClient.exists);
    testUtil.shouldBeAFunction(redClient.exists);

    test('should fail if key is invalid', async () => {
        // Mocks
        expect.assertions(1);
        // Data
        const key = 34234;
        try {
            // Tests
            await redClient.exists(key);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'key\' must be a string');
        }
    });

    test('should return true, if key exists in redis', async () => {
        // Init Pre-condition
        await red.saddAsync(['existingKey', 'value']);
        // Data
        const key = 'existingKey';
        const reply = await redClient.exists(key);
        expect(reply).toBeTruthy();
    });

    test('should return false, if key does not exist in redis', async () => {
        // Data
        const key = 'nonExistKey';
        // Tests
        const reply = await redClient.exists(key);
        // Expects
        expect(reply).toBeFalsy();
    });
});

describe('multiget', () => {
    testUtil.shouldExist(redClient.multiget);
    testUtil.shouldBeAFunction(redClient.multiget);

    test('should fail if keyPrefix is invalid', async () => {
        // Mocks
        expect.assertions(1);
        // Data
        const keyPrefix = 34234;
        const ids = [34234];
        try {
            // Tests
            await redClient.multiget(keyPrefix, ids);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'keyPrefix\' must be a string');
        }
    });

    test('should fail if non-array ids', async () => {
        // Mocks
        expect.assertions(1);
        try {
            // Data
            const keyPrefix = '34234';
            const ids = 34234;
            // Tests
            await redClient.multiget(keyPrefix, ids);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'ids\' must be a nonEmptyString[]');
        }
    });

    test('should return data for all available ids', async () => {
        // Init Pre-condition
        const expectedResult = [{ field1: 'value1' },
        { field2: 'value2' },
        { field3: 'value3' }];
        await red.hmsetAsync(['existingKey:1', 'field1', 'value1']);
        await red.hmsetAsync(['existingKey:2', 'field2', 'value2']);
        await red.hmsetAsync(['existingKey:3', 'field3', 'value3']);
        await red.hmsetAsync(['existingKey:4', 'field4', 'value4']);
        // Data
        const keyPrefix = 'existingKey:';
        const ids = ['1', '2', '3'];
        // Tests
        const reply = await redClient.multiget(keyPrefix, ids);
        // Expects
        expect(reply).toEqual(expectedResult);
    });

    test('should return data for available ids and null for un-available ids', async () => {
        // Init Pre-condition
        const expectedResult = [{ field1: 'value1' },
        { field2: 'value2' },
        { field3: 'value3' },
            null];
        await red.hmsetAsync(['existingKey:1', 'field1', 'value1']);
        await red.hmsetAsync(['existingKey:2', 'field2', 'value2']);
        await red.hmsetAsync(['existingKey:3', 'field3', 'value3']);
        await red.hmsetAsync(['existingKey:4', 'field4', 'value4']);
        // Data
        const keyPrefix = 'existingKey:';
        const ids = ['1', '2', '3', '5'];
        // Tests
        const reply = await redClient.multiget(keyPrefix, ids);
        // Expects
        expect(reply).toEqual(expectedResult);
    });
});

describe('scan', () => {
    testUtil.shouldExist(redClient.scan);
    testUtil.shouldBeAFunction(redClient.scan);

    test('should fail if cursor is invalid', async () => {
        // Mocks
        expect.assertions(1);
        // Data
        const cursor = '34';
        const keyMatch = 'key*';
        try {
            // Tests
            await redClient.scan(cursor, keyMatch);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'cursor\' must be a number');
        }
    });

    test('should fail if keyMatch is invalid', async () => {
        // Mocks
        expect.assertions(1);
        // Data
        const cursor = 34;
        const keyMatch = 54;
        try {
            // Tests
            await redClient.scan(cursor, keyMatch);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'keyMatch\' must be a string');
        }
    });
});

describe('del', () => {
    testUtil.shouldExist(redClient.del);
    testUtil.shouldBeAFunction(redClient.del);

    test('should fail if key is invalid', async () => {
        // Mocks
        expect.assertions(1);
        // Data
        const key = 34234;
        try {
            // Tests
            await redClient.del(key);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'key\' must be a string');
        }
    });

    test('should return 1, if key exists and it is deleted', async () => {
        // Init Pre-condition
        await red.saddAsync(['existingKey', 'value']);
        // Data
        const key = 'existingKey';
        // Tests
        const reply = await redClient.del(key);
        // Expects
        expect(reply).toBe(1);
    });

    test('should return 1, if key exists and it is deleted', async () => {
        // Init Pre-condition
        // Data
        const key = 'nonExistingKey';
        // Tests
        const reply = await redClient.del(key);
        // Expects
        expect(reply).toBe(0);
    });
});

describe('sadd', () => {
    afterEach(async () => {
        //flushing the db
        await red.sendCommandAsync('kjfidsujposdvm;l,dvml;dskfw4iort0ewopgksjef;ldsml;sdkg[pfskplsdjkgfg');
    });

    testUtil.shouldExist(redClient.sadd);
    testUtil.shouldBeAFunction(redClient.sadd);

    test('should fail if key is invalid', async () => {
        // Mocks
        expect.assertions(1);
        // Data
        const key = 34234;
        try {
            // Tests
            await redClient.sadd(key);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'key\' must be a string');
        }
    });

    test('should fail if value is not defined', async () => {
        // Mocks
        expect.assertions(1);
        // Data
        const key = '34234';
        const value = undefined;
        try {
            // Tests
            await redClient.sadd(key, value);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'value\' must be a defined');
        }
    });

    test('should fail if expirySecs is invalid', async () => {
        // Mocks
        expect.assertions(1);
        // Data
        const key = '34234';
        const value = 'somevalue';
        const expirySecs = 'sfsf';
        try {
            // Tests
            await redClient.sadd(key, value, expirySecs);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'expirySecs\' must be null or a number');
        }
    });

    test('should add the set without expiry', async () => {
        // Init Pre-condition
        // Data
        const key = 'setname1';
        const value = 'value';
        // Tests
        const reply = await redClient.sadd(key, value);
        const replyMembers = await red.smembersAsync(key);
        const replyExpiry = await red.ttlAsync(key);
        // Expects
        expect(reply).toBe(1);
        const expectedMembers = ['value'];
        expect(replyMembers).toEqual(expectedMembers);
        expect(replyExpiry).toBe(-1); //-1: Exists, but no TTL
    });

    test('should add the set with expiry', async () => {
        // Init Pre-condition
        // Data
        const key = 'setname2';
        const value = 'value';
        const expirySecs = 30;
        // Tests
        const reply = await redClient.sadd(key, value, expirySecs);
        const replyMembers = await red.smembersAsync(key);
        const replyExpiry = await red.ttlAsync(key);
        // Expects
        expect(reply).toBe(1);
        const expectedMembers = ['value'];
        expect(replyMembers).toEqual(expectedMembers);
        expect(replyExpiry).toBe(30);
    });

    test('should add the value to set w/o changing expiry for existing set', async () => {
        // Init Pre-condition
        const key = 'setname3';
        const value = 'value';
        await red.saddAsync([key, value]);
        // Data
        const value2 = 'value2';
        const expirySecs = 30;
        // Tests
        const reply = await redClient.sadd(key, value2, expirySecs);
        const replyMembers = await red.smembersAsync(key);
        const replyExpiry = await red.ttlAsync(key);
        // Expects
        expect(reply).toBe(1);
        const expectedMembers = ['value2', 'value'];
        expect(replyMembers).toEqual(expectedMembers);
        expect(replyExpiry).toBe(-1);
    });
});

describe('srem', () => {
    afterEach(async () => {
        //flushing the db
        await red.sendCommandAsync('kjfidsujposdvm;l,dvml;dskfw4iort0ewopgksjef;ldsml;sdkg[pfskplsdjkgfg');
    });

    testUtil.shouldExist(redClient.srem);
    testUtil.shouldBeAFunction(redClient.srem);

    test('should fail if key is invalid', async () => {
        // Mocks
        expect.assertions(1);
        // Data
        const key = 34234;
        try {
            // Tests
            await redClient.srem(key);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'key\' must be a string');
        }
    });

    test('should fail if value is not defined', async () => {
        // Mocks
        expect.assertions(1);
        // Data
        const key = '34234';
        const value = undefined;
        try {
            // Tests
            await redClient.srem(key, value);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'value\' must be a defined');
        }
    });

    test('should return 1, if value exists in key', async () => {
        // Init Pre-condition
        const key = 'setname';
        await red.saddAsync([key, 'value1', 'value2', 'value3']);
        // Data
        const value = 'value1';
        // Tests
        const reply = await redClient.srem(key, value);
        // Expects
        expect(reply).toBe(1);
    });

    test('should return 0, if value does not exist in key', async () => {
        // Init Pre-condition
        const key = 'setname2';
        await red.saddAsync([key, 'value1', 'value2', 'value3']);
        // Data
        const value = 'value5';
        // Tests
        const reply = await redClient.srem(key, value);
        // Expects
        expect(reply).toBe(0);
    });
});

describe('spop', () => {
    afterEach(async () => {
        //flushing the db
        await red.sendCommandAsync('kjfidsujposdvm;l,dvml;dskfw4iort0ewopgksjef;ldsml;sdkg[pfskplsdjkgfg');
    });

    testUtil.shouldExist(redClient.spop);
    testUtil.shouldBeAFunction(redClient.spop);

    test('should fail if key is invalid', async () => {
        // Mocks
        expect.assertions(1);
        // Data
        const key = 34234;
        try {
            // Tests
            await redClient.spop(key);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'key\' must be a string');
        }
    });

    test('should return the last inserted item', async () => {
        // Init Pre-condition
        const key = 'sname';
        await red.delAsync(key);
        await red.saddAsync([key, 'value1']);
        await red.saddAsync([key, 'value2']);
        await red.saddAsync([key, 'value3']);
        const members = await red.smembersAsync(key);
        const expectedReply = members[members.length - 1];
        // Data
        // Tests
        const reply = await redClient.spop(key);
        // Expects
        expect(reply).toBe(expectedReply);
    });

    test('should return null if no items present', async () => {
        // Init Pre-condition
        const key = 'setname2';
        await red.saddAsync([key, 'value1']);
        await red.spopAsync(key);
        // Data
        // Tests
        const reply = await redClient.spop(key);
        // Expects
        expect(reply).toBe(null);
    });
});

describe('smembers', () => {
    testUtil.shouldExist(redClient.smembers);
    testUtil.shouldBeAFunction(redClient.smembers);

    test('should fail if key is invalid', async () => {
        // Mocks
        expect.assertions(1);
        // Data
        const key = 34234;
        try {
            // Tests
            await redClient.smembers(key);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'key\' must be a string');
        }
    });

    test('should return all members of the set', async () => {
        // Init Pre-condition
        const key = 'sname';
        await red.delAsync(key);
        await red.saddAsync([key, 'value1']);
        await red.saddAsync([key, 'value2']);
        await red.saddAsync([key, 'value3']);
        const expectedReply = await red.smembersAsync(key);
        // Data
        // Tests
        const reply = await redClient.smembers(key);
        // Expects
        expect(reply).toEqual(expectedReply);
    });
});

describe('sismember', () => {
    testUtil.shouldExist(redClient.sismember);
    testUtil.shouldBeAFunction(redClient.sismember);

    test('should fail if key is invalid', async () => {
        // Mocks
        expect.assertions(1);
        // Data
        const key = 34234;
        try {
            // Tests
            await redClient.sismember(key);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'key\' must be a string');
        }
    });

    test('should fail if value is not defined', async () => {
        // Mocks
        expect.assertions(1);
        // Data
        const key = '34234';
        const value = undefined;
        try {
            // Tests
            await redClient.sismember(key, value);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'value\' must be a defined');
        }
    });

    test('should return 1, if value exists', async () => {
        // Init Pre-condition
        const key = 'sname';
        await red.delAsync(key);
        await red.saddAsync([key, 'value1']);
        await red.saddAsync([key, 'value2']);
        await red.saddAsync([key, 'value3']);
        // Data
        const value = 'value1';
        // Tests
        const reply = await redClient.sismember(key, value);
        // Expects
        expect(reply).toEqual(1);
    });

    test('should return 0, if value does not exists', async () => {
        // Init Pre-condition
        const key = 'sname';
        await red.delAsync(key);
        await red.saddAsync([key, 'value1']);
        await red.saddAsync([key, 'value2']);
        await red.saddAsync([key, 'value3']);
        // Data
        const value = 'value5';
        // Tests
        const reply = await redClient.sismember(key, value);
        // Expects
        expect(reply).toEqual(0);
    });
});

describe('zadd', () => {
    testUtil.shouldExist(redClient.zadd);
    testUtil.shouldBeAFunction(redClient.zadd);

    test('should fail if key is invalid', async () => {
        // Mocks
        expect.assertions(1);
        // Data
        const key = 34234;
        try {
            // Tests
            await redClient.zadd(key);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'key\' must be a string');
        }
    });

    test('should fail if value is not defined', async () => {
        // Mocks
        expect.assertions(1);
        // Data
        const key = '34234';
        const value = undefined;
        try {
            // Tests
            await redClient.zadd(key, value);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'value\' must be a defined');
        }
    });

    test('should fail if score is invalid', async () => {
        // Mocks
        expect.assertions(1);
        // Data
        const key = '34234';
        const value = 'dfdasf';
        const score = 'dffsdf';
        try {
            // Tests
            await redClient.zadd(key, value, score);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'score\' must be a number');
        }
    });
});

describe('zrem', () => {
    testUtil.shouldExist(redClient.zrem);
    testUtil.shouldBeAFunction(redClient.zrem);

    test('should fail if key is invalid', async () => {
        // Mocks
        expect.assertions(1);
        // Data
        const key = 34234;
        try {
            // Tests
            await redClient.zrem(key);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'key\' must be a string');
        }
    });

    test('should fail if value is not defined', async () => {
        // Mocks
        expect.assertions(1);
        // Data
        const key = '34234';
        const value = undefined;
        try {
            // Tests
            await redClient.zrem(key, value);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'value\' must be a defined');
        }
    });
});

describe('zrangebyscore', () => {
    testUtil.shouldExist(redClient.zrangebyscore);
    testUtil.shouldBeAFunction(redClient.zrangebyscore);

    test('should fail if key is invalid', async () => {
        // Mocks
        expect.assertions(1);
        // Data
        const key = 34234;
        try {
            // Tests
            await redClient.zrangebyscore(key);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'key\' must be a string');
        }
    });

    test('should fail if scoreMin is not a string or number', async () => {
        // Mocks
        expect.assertions(1);
        // Data
        const key = '34234';
        const scoreMin = undefined;
        try {
            // Tests
            await redClient.zrangebyscore(key, scoreMin);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'scoreMin\' must be a number or string');
        }
    });

    test('should fail if scoreMax is not a string or number', async () => {
        // Mocks
        expect.assertions(1);
        // Data
        const key = '34234';
        const scoreMin = 12662;
        const scoreMax = undefined;
        try {
            // Tests
            await redClient.zrangebyscore(key, scoreMin, scoreMax);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'scoreMax\' must be a number or string');
        }
    });
});

describe('zremrangebyscore', () => {
    testUtil.shouldExist(redClient.zremrangebyscore);
    testUtil.shouldBeAFunction(redClient.zremrangebyscore);

    test('should fail if key is invalid', async () => {
        // Mocks
        expect.assertions(1);
        // Data
        const key = 34234;
        try {
            // Tests
            await redClient.zremrangebyscore(key);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'key\' must be a string');
        }
    });

    test('should fail if scoreMin is not a string or number', async () => {
        // Mocks
        expect.assertions(1);
        // Data
        const key = '34234';
        const scoreMin = undefined;
        try {
            // Tests
            await redClient.zremrangebyscore(key, scoreMin);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'scoreMin\' must be a number or string');
        }
    });

    test('should fail if scoreMax is not a string or number', async () => {
        // Mocks
        expect.assertions(1);
        // Data
        const key = '34234';
        const scoreMin = 12662;
        const scoreMax = undefined;
        try {
            // Tests
            await redClient.zremrangebyscore(key, scoreMin, scoreMax);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'scoreMax\' must be a number or string');
        }
    });
});

describe('lpush', () => {
    testUtil.shouldExist(redClient.lpush);
    testUtil.shouldBeAFunction(redClient.lpush);

    test('should fail if key is invalid', async () => {
        // Mocks
        expect.assertions(1);
        // Data
        const key = 34234;
        try {
            // Tests
            await redClient.lpush(key);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'key\' must be a string');
        }
    });

    test('should fail if value is not defined', async () => {
        // Mocks
        expect.assertions(1);
        // Data
        const key = '34234';
        const value = undefined;
        try {
            // Tests
            await redClient.lpush(key, value);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'value\' must be a defined');
        }
    });
});

describe('hmset', () => {
    testUtil.shouldExist(redClient.hmset);
    testUtil.shouldBeAFunction(redClient.hmset);

    test('should fail if key is invalid', async () => {
        // Mocks
        expect.assertions(1);
        // Data
        const key = 34234;
        try {
            // Tests
            await redClient.hmset(key);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'key\' must be a string');
        }
    });
});

describe('hincrby', () => {
    testUtil.shouldExist(redClient.hincrby);
    testUtil.shouldBeAFunction(redClient.hincrby);

    test('should fail if key is invalid', async () => {
        // Mocks
        expect.assertions(1);
        // Data
        const key = 34234;
        try {
            // Tests
            await redClient.hincrby(key);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'key\' must be a string');
        }
    });

    test('should fail if field is invalid', async () => {
        // Mocks
        expect.assertions(1);
        // Data
        const key = '34234';
        const field = 34523;
        try {
            // Tests
            await redClient.hincrby(key, field);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'field\' must be a string');
        }
    });

    test('should fail if incrBy is invalid', async () => {
        // Mocks
        expect.assertions(1);
        // Data
        const key = '34234';
        const field = '34523';
        const incrBy = '3r43';
        try {
            // Tests
            await redClient.hincrby(key, field, incrBy);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'incrBy\' must be a number');
        }
    });
});

describe('hgetall', () => {
    testUtil.shouldExist(redClient.hgetall);
    testUtil.shouldBeAFunction(redClient.hgetall);

    test('should fail if key is invalid', async () => {
        // Mocks
        expect.assertions(1);
        // Data
        const key = 34234;
        try {
            // Tests
            await redClient.hgetall(key);
        } catch (err) {
            // Expects
            expect(err.message).toEqual('argument \'key\' must be a string');
        }
    });
});
