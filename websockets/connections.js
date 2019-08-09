let connections = new Map();

module.exports = {
    getConnections: () => {
        return connections;
    },

    inform: async (user_id, data) => {
        const wsConn = connections.get(user_id);
        if (!!wsConn)
            connections.get(user_id).send(JSON.stringify(data));
    },
}