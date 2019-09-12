const mongodb = require('./mongo').getDbConnection;
const dbtables = require('./dbtables');

module.exports = {
  getNextValue: async (sequenceName) => {
    console.log('db.sequencecounter.getNextSequenceValue');
    const sequenceDocument = await mongodb()
        .collection(dbtables.SequenceCounter)
        .findOneAndUpdate(
            {sequenceName: sequenceName},
            {
              $inc: {sequenceValue: 1},
            }
        );

    return sequenceDocument.value.sequenceValue;
  },
};
