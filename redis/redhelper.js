const redClient = require('./redclient');
const keyPrefix = require('./key_prefix');

module.exports = {
  createUser: async (userid, phoneNumber) => {
    if (!userid ||
            !phoneNumber) {
      throw new Error('Invalid Arguments');
    }

    await redClient.hmset(keyPrefix.phoneNumber + phoneNumber, 'id', userid);
  },
  addGroupUser: async (groupid, userid) => {
    if (!groupid ||
            !userid) {
      throw new Error('Invalid Arguments');
    }

    if (await redClient.exists(keyPrefix.usersOfGroup + groupid) == 1) {
      return await redClient.sadd(keyPrefix.usersOfGroup + groupid, userid);
    } else {
      return await redClient.sadd(keyPrefix.usersOfGroup + groupid, userid);
    }
  },
  createPollResult: async (pollid, options, createdAt, updatedAt) => {
    if (!pollid ||
            !options ||
            !createdAt ||
            !updatedAt) {
      throw new Error('Invalid Arguments');
    }

    await redClient.hmset(keyPrefix.pollResult + pollid, 'id', pollid,
        'at1', createdAt, 'at2', updatedAt);
    options.forEach(async (option, index) => {
      await redClient.hmset(keyPrefix.pollResult + pollid,
          'OV' + index.toString(), 0,
          'SV' + index.toString(), 0);
    });
  },
  updateOpenVoteResult: async (pollid, optionindex) => {
    if (!pollid ||
            optionindex === undefined) {
      throw new Error('Invalid Arguments');
    }

    await redClient.hincrby(keyPrefix.pollResult + pollid,
        'OV' + optionindex.toString(), 1);
  },
  updateSecretVoteResult: async (pollid, optionindex) => {
    if (!pollid ||
            optionindex === undefined) {
      throw new Error('Invalid Arguments');
    }

    await redClient.hincrby(keyPrefix.pollResult + pollid,
        'SV' + optionindex.toString(), 1);
  },
  getUserIdsByPhone: async (phoneNumbers) => {
    if (!phoneNumbers) {
      throw new Error('Invalid Arguments');
    }

    return await redClient.multiget(keyPrefix.phoneNumber, phoneNumbers);
  },
  getPollResults: async (pollids) => {
    if (!pollids) {
      throw new Error('Invalid Arguments');
    }

    return await redClient.multiget(keyPrefix.pollResult, pollids);
  },
  getPollResult: async (pollid) => {
    if (!pollid) {
      throw new Error('Invalid Arguments');
    }

    return await redClient.hgetall(keyPrefix.pollResult + pollid);
  },
  getSubscribedUsers: async (pollid) => {
    if (!pollid) {
      throw new Error('Invalid Arguments');
    }

    try {
      return await redClient
          .zrangebyscore(keyPrefix.pollSubsription + pollid, '-inf', '+inf');
    } catch (err) {
      console.log(err);
    }
  },
  getSubscribedUsersUntilTime: async (pollid, timeUntilSubscriptionMade) => {
    if (!pollid ||
            !timeUntilSubscriptionMade) {
      throw new Error('Invalid Arguments');
    }

    return await redClient.zrangebyscore(keyPrefix.pollSubsription + pollid,
        '-inf', timeUntilSubscriptionMade);
  },
  removeElapsedSubscriptions: async (pollid, timeUntilSubscriptionMade) => {
    if (!pollid ||
            !timeUntilSubscriptionMade) {
      throw new Error('Invalid Arguments');
    }

    return await redClient.zremrangebyscore(keyPrefix.pollSubsription + pollid,
        '-inf', timeUntilSubscriptionMade);
  },
};
