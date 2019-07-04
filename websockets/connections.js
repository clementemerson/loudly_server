let connections = new Map();
let pollResultSubscriptions = {};
let userPollSubscriptions = {};

module.exports = {
    getConnections: () => {
        return connections;
    },

    getPollResultSubscriptions: () => {
        return pollResultSubscriptions;
    },

    getUserPollSubscriptions: () => {
        return userPollSubscriptions;
    },

    inform: async (listOfUsers, data) => {
        listOfUsers.forEach(eachUser => {
            if (connections.get(eachUser.user_id))
                connections.get(eachUser.user_id).send(JSON.stringify(data));
        });
    },

    unsubscribeUserSubscriptions: (user_id) => {
        console.log('connections.unsubscribeUserSubscriptions');
        const pollArray = userPollSubscriptions[user_id];
        if (pollArray) {
            pollArray.forEach(pollid => {
                try {
                    //Remove entry from pollresult subscription
                    const subscribersArray = pollResultSubscriptions[pollid];
                    if (subscribersArray) {
                        var index = subscribersArray.indexOf(user_id);
                        if (index > -1)
                            subscribersArray.splice(index, 1);
                    }
                } catch (err) {
                    console.log(err);
                }
            });
        }

        delete userPollSubscriptions[user_id];
    }
}