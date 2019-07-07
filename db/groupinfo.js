var mongodb = require('./mongo').getDbConnection;
var dbtables = require('./dbtables');

module.exports = {
    create: async (data) => {
        console.log('db.groupinfo.create');
        let createdAt = data.time.getTime();
        let updatedAt = data.time.getTime();

        await mongodb().collection(dbtables.GroupInfo).insertOne({
            groupid: data.id,
            name: data.name,
            desc: data.desc,
            createdby: data.createdby,
            createdAt: createdAt,
            updatedAt: updatedAt
        });
    },

    changeTitle: async (data) => {
        console.log('db.groupinfo.changeTitle');
        let date = new Date();
        let updatedAt = date.getTime();

        await mongodb().collection(dbtables.GroupInfo).updateOne(
            { groupid: data.groupid },
            {
                $set: {
                    name: data.name,
                    updatedAt: updatedAt
                }
            });
    },

    changeDesc: async (data) => {
        console.log('db.groupinfo.changeDesc');
        let date = new Date();
        let updatedAt = date.getTime();

        await mongodb().collection(dbtables.GroupInfo).updateOne(
            { groupid: data.groupid },
            {
                $set: {
                    desc: data.desc,
                    updatedAt: updatedAt
                }
            });
    },

    delete: async (data) => {
        console.log('db.groupinfo.delete');
        await mongodb().collection(dbtables.GroupInfo).remove({
            groupid: data.id
        });
    },

    getGroupsInfo: async (data) => {
        console.log('db.groupinfo.getGroupsInfo');
        return await mongodb().collection(dbtables.GroupInfo)
            .find({ groupid: { $in: data.groupids } })
            .toArray();
    },
}