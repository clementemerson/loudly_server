let connections = require('../websockets/connections');
let GroupUsers = require('../db/groupusers');

module.exports = {

    //Internal function
    informUsers: async (groupid, data) => {
        let groupUsers = await GroupUsers.getUsers(groupid);
        connections.inform(groupUsers, data);
    },
}