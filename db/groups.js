var mongodb = require('./mongo').getDbConnection;
var dbtables = require('./dbtables');

module.exports = {
    create: async (data) => {

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
        let date = new Date();
        let updatedAt = date.toISOString();

        await mongodb().collection(dbtables.GroupInfo).update(
            { id: data.id },
            {
                name: data.name,
                updatedAt: updatedAt
            });
    },

    changeDesc: async (data) => {
        let date = new Date();
        let updatedAt = date.toISOString();

        await mongodb().collection(dbtables.GroupInfo).update(
            { id: data.id },
            {
                desc: data.desc,
                updatedAt: updatedAt
            });
    },

    delete: async (data) => {
        await mongodb().collection(dbtables.GroupInfo).remove({
            id: data.id
        });
    },

    getDetails: async (data) => {
        await mongodb().collection(dbtables.GroupInfo)
            .find({ id: data.id })
            .toArray();
    }
}