const mongoClient = require('./mongo').getDbClient;

module.exports = {
  commit: async (session) => {
    console.log('commitTransaction...');
    await session.commitTransaction();
    session.endSession();
  },
  abort: async (session) => {
    if (!session || session.inTransaction() === false) {
      return;
    }

    console.log('abortTransaction...');
    await session.abortTransaction();
    session.endSession();
  },
  start: async () => {
    console.log('startSession...');
    const session = await mongoClient().startSession();
    session.startTransaction();
    return session;
  },
};
