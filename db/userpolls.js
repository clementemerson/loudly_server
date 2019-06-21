var mongodb = require('./mongo').getDbConnection;
var dbtables = require('./dbtables');

module.exports = {

    shareWithUser: async (data) => {
        console.log('db.userpolls.shareWithUser');
        let date = new Date();
        let createdAt = date.toISOString();
        let updatedAt = date.toISOString();

        await mongodb().collection(dbtables.UserPolls).update(
            {
                pollid: data.pollid,
                userid: data.user_id,
            },
            {
                pollid: data.pollid,
                userid: data.user_id,
                sharedby: data.sharedby,
                createdAt: createdAt,
                updatedAt: updatedAt
            },
            { upsert: true });
    },

    userHasPoll: async (data) => {
        console.log('db.userpolls.userHasPoll');
        let polls = await mongodb().collection(dbtables.UserPolls)
            .find({
                pollid: data.pollid,
                userid: data.user_id
            }).toArray();
        return polls[0];
    },

    getPolls: async (user_id) => {
        console.log('db.userpolls.getPolls');
        return await mongodb().collection(dbtables.UserPolls)
            .find({ userid: user_id })
            .toArray();
    },

}