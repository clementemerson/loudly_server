var connections = {}

module.exports = {
    getConnections: () => {
        return connections;
    },

    inform: async (listOfUsers, data) => {
        listOfUsers.forEach(eachUser => {
            if(connections[eachUser.user_id]) 
                connections[eachUser.user_id].send(JSON.stringify(data));
        });
    }
}