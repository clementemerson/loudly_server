const errors = require('../helpers/errorstousers');
const success = require('../helpers/successtousers');

/**
 * This function prepares the reply, that is to be sent
 * to the client.
 *
 * @param {*} incomingMessage The actual message received
 * @param {*} data  The data to be sent to the client
 * @return {Reply}
 */
function prepareReply(incomingMessage, data) {
  const reply = {
    module: incomingMessage.module,
    event: incomingMessage.event,
    messageid: incomingMessage.messageid,
    data: data,
  };
  return reply;
}

module.exports = {

  /**
     *
     *
     * @param {*} message
     * @param {*} replyData
     * @return {Reply}
     */
  prepareSuccess: async (message, replyData) => {
    const reply = prepareReply(message, replyData);
    return success.sendData(reply);
  },

  /**
   *
   *
   * @param {*} message
   * @param {*} error
   * @return {Reply}
   */
  prepareError: async (message, error) => {
    const replyData = {
      status: error,
    };
    const reply = prepareReply(message, replyData);
    return errors.sendData(reply);
  },
};
