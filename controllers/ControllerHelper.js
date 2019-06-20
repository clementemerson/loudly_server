let connections = require('../websockets/connections');
let GroupUsers = require('../db/groupusers');

module.exports = {

    //Internal function
    informUsers: async (groupid, data) => {
        const groups = {
            groupids: [groupid]
        };

        let groupUsers = await GroupUsers.getUsers(groups);
        connections.inform(groupUsers, data);
    }
}