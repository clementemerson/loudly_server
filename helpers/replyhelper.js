var dbTransactions = require('../db/session');

var errors = require('../helpers/errorstousers');
var success = require('../helpers/successtousers');

function prepareReply(incomingMessage, data) {
    let reply = {
        module: incomingMessage.module,
        event: incomingMessage.event,
        messageid: incomingMessage.messageid,
        data: data
    }
    return reply;
}

module.exports = {

    prepareSuccess: async (message, dbsession, replyData) => {
        if(dbsession)
            await dbTransactions.commitTransaction(dbsession);
        let reply = prepareReply(message, replyData);
        return success.sendData(reply);
    },

    prepareError: async (message, dbsession, error) => {
        if(dbsession)
            await dbTransactions.abortTransaction(dbsession);

        let replyData = {
            status: error
        }
        let reply = prepareReply(message, replyData);
        return errors.sendData(reply);
    }
}