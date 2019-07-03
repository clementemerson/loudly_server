var connections = new Map();

module.exports = {
    getConnections: () => {
        return connections;
    },

    inform: async (listOfUsers, data) => {
        listOfUsers.forEach(eachUser => {
            if (connections.get(eachUser.user_id))
                connections.get(eachUser.user_id).send(JSON.stringify(data));
        });
    }
}