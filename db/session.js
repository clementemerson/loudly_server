var mongodb = require('./mongo').getDbConnection;

module.exports = {
    commitTransaction: async (session) => {
        await session.commitTransaction();
        session.endSession();
    },
    abortTransaction: async (session) => {
        await session.abortTransaction();
        session.endSession();
    },
    startSession: () => {
        return mongodb().startSession();
    }
}