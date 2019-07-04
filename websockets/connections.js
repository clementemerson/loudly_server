var connections = new Map();
var pollResultSubscriptions = {};

module.exports = {
    getConnections: () => {
        return connections;
    },

    getPollResultSubscriptions: () => {
        return pollResultSubscriptions;
    },

    inform: async (listOfUsers, data) => {
        listOfUsers.forEach(eachUser => {
            if (connections.get(eachUser.user_id))
                connections.get(eachUser.user_id).send(JSON.stringify(data));
        });
    }
}