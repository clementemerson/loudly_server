const uuidv4 = require('uuid/v4');
let Groups = require('../db/groups');

module.exports = {
    create: async (message) => {
        console.log('GroupController.create');
        //TODO: nothing
        var data = {};

        data.id = uuidv4();
        data.name = message.data.name;
        data.desc = message.data.desc;
        data.createdby = message.createdby;

        await Groups.create(data);
    },

    changeTitle: async (message) => {
        console.log('GroupController.changeTitle');
        //TODO: create entries in transaction tables
        var data = {};

        data.id = message.data.id;
        data.name = message.data.name;
        data.changedby = message.user_id;

        await Groups.changeTitle(data);
    },

    changeDesc: async (message) => {
        console.log('GroupController.changeDesc');
        //TODO: create entries in transaction tables
        var data = {};

        data.id = message.data.id;
        data.desc = message.data.desc;
        data.changedby = message.user_id;

        await Groups.changeDesc(data);
    },

    delete: async (message) => {
        console.log('GroupController.delete');
        //TODO: create entries in transaction tables
        var data = {};

        data.id = message.data.id;
        data.deleteby = message.user_id;

        await Groups.delete(data);
    },

    getGroupsInfo: async (message) => {
        console.log('GroupController.getGroupsInfo');
        //TODO: nothing
        var data = {};

        data.groupids = message.data.groupids;

        return await Groups.getGroupsInfo(data);
    },

    addUser: async (message) => {
        console.log('GroupController.addUser');
        //TODO: create entries in transaction tables
        var data = {};

        data.groupid = message.data.groupid;
        data.user_id = message.data.user_id;
        data.addedby = message.user_id;
        data.permission = message.data.permission;

        return await Groups.addUser(data);
    },

    changeUserPermission: async (message) => {
        console.log('GroupController.changeUserPermission');
        //TODO: create entries in transaction tables
        var data = {};

        data.groupid = message.data.groupid;
        data.user_id = message.data.user_id;
        data.permission = message.data.permission;

        return await Groups.changeUserPermission(data);
    },

    removeUser: async (message) => {
        console.log('GroupController.removeUser');
        //TODO: create entries in transaction tables
        var data = {};

        data.groupid = message.data.groupid;
        data.user_id = message.data.user_id;

        return await Groups.removeUser(data);
    },

    getUsersOfGroups: async (message) => {
        console.log('GroupController.getUsersOfGroups');
        //TODO: nothing
        var data = {};

        data.groupids = message.data.groupids;

        return await Groups.getUsers(data);
    },

    getPolls: async (message) => {
        console.log('GroupController.getPolls');
        //TODO: nothing
        var data = {};

        data.groupid = message.data.groupid;

        return await Groups.getPolls(data);
    }
}