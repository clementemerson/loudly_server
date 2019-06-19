var mongodb = require('./mongo').getDbConnection;
var dbtables = require('./dbtables');

module.exports = {
    create: async (data) => {
        console.log('db.groupinfo.create');
        let date = new Date();
        let createdAt = date.toISOString();
        let updatedAt = date.toISOString();

        await mongodb().collection(dbtables.GroupInfo).insertOne({
            id: data.id,
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
        let updatedAt = date.toISOString();

        await mongodb().collection(dbtables.GroupInfo).update(
            { id: data.id },
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
        let updatedAt = date.toISOString();

        await mongodb().collection(dbtables.GroupInfo).update(
            { id: data.id },
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
            id: data.id
        });
    },

    getGroupsInfo: async (data) => {
        console.log('db.groupinfo.getGroupsInfo');
        return await mongodb().collection(dbtables.GroupInfo)
            .find({ id: { $in: data.groupids } })
            .toArray();
    },
}