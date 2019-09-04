const VError = require('verror');

module.exports = {
    sendData: function (data) {
        return {
            Status: 'Error',
            Details: data,
        };
    },
    wrapError: function (err) {
        console.log(err.message);
        if ((err instanceof VError) == false) {
            throw new VError(err, errors.internalError.message);
        } else {
            throw err;
        }
    },

    // Common Errors
    internalError: {
        errno: 100,
        message: 'Internal Error',
    },
    unknownEvent: {
        errno: 101,
        message: 'Unknown Event',
    },
    invalidData: {
        errno: 102,
        message: 'Invalid Data',
    },

    // Login Errors
    invalidPhoneNumber: {
        errno: 1000,
        message: 'Invalid phone number',
    },
    errorInProcessing: {
        errno: 1001,
        message: 'Error in processing request',
    },
    errorOTPMismatchOrExpired: {
        errno: 1002,
        message: 'OTP Mismatch or Expired',
    },

    // User module errors
    errorUserNotExists: {
        errno: 3001,
        message: 'User does not exist'
    },


    // Poll module errors
    errorPollNotAvailable: {
        errno: 5001,
        message: 'Poll not available'
    },
    errorUserAlreadyVoted: {
        errno: 5002,
        message: 'User already voted',
    },
    errorUserDoesNotHavePoll: {
        errno: 5003,
        message: 'User does not have the poll'
    },
    errorPollAlreadyInGroup: {
        errno: 5004,
        message: 'Poll already available in the group'
    },
    errorPollIsDeleted: {
        errno: 5005,
        message: 'Poll is deleted. You can share it'
    },
    errorUserNotVoted: {
        errno: 5006,
        message: 'You haven\'t voted yet'
    },
    errorUserNotCreatorOfPoll: {
        errno: 5007,
        message: 'You\'re not the creator of this poll'
    },
    errorPollSharedToGroup: {
        errno: 5008,
        message: 'Poll already shared to a group'
    },


    //Group module errors
    errorUserIsNotMember: {
        errno: 7001,
        message: 'User is not a member of the group'
    },
    errorUserIsMember: {
        errno: 7002,
        message: 'User is a member of the group'
    },
    errorNotAnAdminUser: {
        errno: 7003,
        message: 'You\'re NOT an Admin user'
    },
    errorInvalidPermission: {
        errno: 7004,
        message: 'You are not allowed to set the given permission to the user',
    },
};
