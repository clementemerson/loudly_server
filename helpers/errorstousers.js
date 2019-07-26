module.exports = {
    sendData: function (data) {
        return {
            Status: 'Error',
            Details: data
        };
    },
    unknownError: 'Unknown Error',
    unknownEvent: 'Unknown Event',
    invalidData: 'Invalid Data',
    invalidPhoneNumber: 'Invalid phone number',
    errorInProcessing: 'Error in processing request',
    errorOTPMismatchOrExpired: 'OTP Mismatch or Expired',

    errorPollAlreadyInGroup: 'Poll already available in the group',
    errorUserDoesNotHavePoll: 'User does not have the poll',
    errorUserIsNotMember: 'User is not a member of the group',
    errorUserIsMember: 'User is a member of the group',
    errorUserNotExists: 'User does not exist',
    errorNotAnAdminUser: "You're NOT an Admin user",
    errorPollNotAvailable: 'Poll not available',
    errorUserAlreadyVoted: 'User already voted',
    errorUserNotVoted: "You haven't voted yet",
    errorNotAllowedToSetThisPermission: 'You are not allowed to set the given permission to the user',
    errorUserNotCreatorOfPoll: "You're not the creator of this poll",
    errorPollIsDeleted: "Poll is deleted. You can share it",
};
