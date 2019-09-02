const connections = new Map();

module.exports = {
  getConnections: () => {
    return connections;
  },

  inform: async (userId, data) => {
    const wsConn = connections.get(userId);
    if (!!wsConn) {
      connections.get(userId).send(JSON.stringify(data));
    }
  },
};
