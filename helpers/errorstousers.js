module.exports = {
  sendData: function(data) {
    return {
      Status: 'Error',
      Details: data,
    };
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
  errorUserNotExists: 'User does not exist',


  // Poll module errors

  errorPollAlreadyInGroup: 'Poll already available in the group',
  errorUserDoesNotHavePoll: 'User does not have the poll',
  errorUserIsNotMember: 'User is not a member of the group',
  errorUserIsMember: 'User is a member of the group',
  errorNotAnAdminUser: 'You\'re NOT an Admin user',
  errorPollNotAvailable: 'Poll not available',
  errorUserAlreadyVoted: 'User already voted',
  errorUserNotVoted: 'You haven\'t voted yet',
  errorInvalidPermission: {
    message: 'You are not allowed to set the given permission to the user',
  },
  errorUserNotCreatorOfPoll: 'You\'re not the creator of this poll',
  errorPollIsDeleted: 'Poll is deleted. You can share it',
  errorPollSharedToGroup: 'Poll already shared to a group',
};
