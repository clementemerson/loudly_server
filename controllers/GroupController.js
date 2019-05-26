const uuidv4 = require('uuid/v4');
let Groups = require('../db/groups');

module.exports = {
    create: async (message) => {
        var data = {};

        data.id = uuidv4();
        data.name = message.data.name;
        data.desc = message.data.desc;
        data.createdby = message.createdby;

        await Groups.create(data);
    },

    changeTitle: async (message) => {
        var data = {};

        data.id = message.data.id;
        data.name = message.data.name;
        data.changedby = message.user_id;

        await Groups.changeTitle(data);
    },

    changeDesc: async (message) => {
        var data = {};

        data.id = message.data.id;
        data.desc = message.data.desc;
        data.changedby = message.user_id;

        await Groups.changeDesc(data);
    },

    delete: async (message) => {
        var data = {};

        data.id = message.data.id;
        data.deleteby = message.user_id;

        await Groups.delete(data);
    },

    getDetails: async (message) => {
        var data = {};

        data.id = message.data.id;

        return await Groups.getDetails(data);
    }
}