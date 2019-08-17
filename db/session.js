var mongodb = require('./mongo').getDbConnection;
var mongoClient = require('./mongo').getDbClient;

module.exports = {
    commitTransaction: async (session) => {
        console.log('commitTransaction...');
        await session.commitTransaction();
        session.endSession();
    },
    abortTransaction: async (session) => {
        console.log('abortTransaction...');
        await session.abortTransaction();
        session.endSession();
    },
    startSession: async () => {
        console.log('startSession...');
        let session = await mongoClient().startSession();
        session.startTransaction();
        return session;
    }
}