var mongodb = require('./mongo').getDbConnection;
var mongoClient = require('./mongo').getDbClient;

module.exports = {
    commitTransaction: async (session) => {
        await session.commitTransaction();
        session.endSession();
    },
    abortTransaction: async (session) => {
        await session.abortTransaction();
        session.endSession();
    },
    startSession: async () => {
        let session = await mongoClient().startSession();
        session.startTransaction();
        return session;
    }
}