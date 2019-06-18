var mongodb = require('./mongo').getDbConnection;
var dbtables = require('./dbtables');

module.exports = {
    getNextSequenceValue: async (sequenceName) => {
        var sequenceDocument = await mongodb().collection(dbtables.SequenceCounter)
        .findOneAndUpdate(
            { sequenceName: sequenceName },
            { $inc: { sequenceValue: 1 },
        });

        return sequenceDocument.value.sequenceValue;
    },
}