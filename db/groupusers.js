var mongodb = require('./mongo').getDbConnection;
var dbtables = require('./dbtables');

module.exports = {

    addUser: async (data) => {
        console.log('db.groupusers.addUser');
        let date = new Date();
        let createdAt = date.getTime();
        let updatedAt = date.getTime();

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
        console.log('db.groupusers.changeUserPermission');
        let date = new Date();
        let updatedAt = date.getTime();

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
        console.log('db.groupusers.removeUser');
        await mongodb().collection(dbtables.GroupUsers).remove({
            groupid: data.groupid,
            user_id: data.user_id
        });
    },

    getUsers: async (groupid) => {
        console.log('db.groupusers.getUsers');
        return await mongodb().collection(dbtables.GroupUsers)
            .find({ groupid: groupid })
            .toArray();
    },

    isAdmin: async (data) => {
        console.log('db.groupusers.isAdmin');
        let adminUser = await mongodb().collection(dbtables.GroupUsers)
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
    },

    isMember: async (data) => {
        console.log('db.groupusers.isMember');
        let user = await mongodb().collection(dbtables.GroupUsers)
            .find({
                groupid: data.groupid,
                user_id: data.user_id
            })
            .toArray();

        if (user[0])
            return true;
        else
            return false;
    },

    getGroupsOfUser: async (user_id) => {
        console.log('db.groupusers.getGroupsOfUser');

        return await mongodb().collection(dbtables.GroupUsers).find({
            user_id: user_id,
        })
        .toArray();;
    },
}