var mongodb = require('./mongo').getDbConnection;
var dbtables = require('./dbtables');

module.exports = {
    create: async (data) => {
        console.log('db.groups.create');
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
        console.log('db.groups.changeTitle');
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
        console.log('db.groups.changeDesc');
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
        console.log('db.groups.delete');
        await mongodb().collection(dbtables.GroupInfo).remove({
            id: data.id
        });
    },

    getGroupsInfo: async (data) => {
        console.log('db.groups.getGroupsInfo');
        await mongodb().collection(dbtables.GroupInfo)
            .find({ id: { $in: data.groupids } })
            .toArray();
    },

    addUser: async (data) => {
        console.log('db.groups.addUser');
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
        console.log('db.groups.changeUserPermission');
        let date = new Date();
        let updatedAt = date.toISOString();

        await mongodb().collection(dbtables.GroupUsers).update(
            {
                groupid: data.groupid,
                user_id: data.user_id
            },
            {
                $set: {
                    permission: data.permission,
                    updatedAt: updatedAt
                }
            }
        );
    },

    removeUser: async (data) => {
        console.log('db.groups.removeUser');
        await mongodb().collection(dbtables.GroupUsers).remove({
            groupid: data.groupid,
            user_id: data.user_id
        });
    },

    getUsers: async (data) => {
        console.log('db.groups.getUsers');
        return await mongodb().collection(dbtables.GroupUsers)
            .find({ groupid: { $in: data.groupids } })
            .toArray();
    },

    getPolls: async (data) => {
        console.log('db.groups.getPolls');
        return await mongodb().collection(dbtables.GroupPolls)
            .find({ groupid: data.groupid })
            .toArray();
    },

    isAdmin: async (data) => {
        console.log('db.groups.isAdmin');
        let adminUser = await mongodb().collection(dbtables.GroupPolls)
            .find({
                groupid: data.groupid,
                user_id: data.user_id,
                permission: 'ADMIN'
            })
            .toArray();

        if (adminUser[0])
            return true;
        else
            return false;
    }
}