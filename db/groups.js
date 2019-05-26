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

    getGroupsInfo: async (data) => {
        await mongodb().collection(dbtables.GroupInfo)
            .find({ id: { $in: data.groupids } })
            .toArray();
    },

    addUser: async (data) => {
        let date = new Date();
        let createdAt = date.toISOString();
        let updatedAt = date.toISOString();

        await mongodb().collection(dbtables.GroupUsers).insertOne({
            groupid: data.groupid,
            user_id: data.user_id,
            addedby: data.addedby,
            permission: data.permission,
            createdAt: createdAt,
            updatedAt: updatedAt
        });
    },

    changeUserPermission: async (data) => {
        let date = new Date();
        let updatedAt = date.toISOString();

        await mongodb().collection(dbtables.GroupUsers).update(
            {
                groupid: data.groupid,
                user_id: data.user_id
            },
            {
                permission: data.permission,
                updatedAt: updatedAt
            }
        );
    },

    removeUser: async (data) => {
        await mongodb().collection(dbtables.GroupUsers).remove({
            groupid: data.groupid,
            user_id: data.user_id
        });
    },

    getUsers: async (data) => {
        return await mongodb().collection(dbtables.GroupUsers)
            .find({ groupid: { $in: data.groupids } })
            .toArray();
    },

    getPolls: async (data) => {
        await mongodb().collection(dbtables.GroupPolls)
            .find({ groupid: data.groupid })
            .toArray();
    },
}