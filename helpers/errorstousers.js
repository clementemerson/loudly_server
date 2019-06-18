module.exports = {
    sendData: function (data) {
        return {
            Status: 'Error',
            Details: data
        };
    },
    unknownError: 'Unknown Error',
    invalidData: 'Invalid Data',
    invalidPhoneNumber: 'Invalid phone number',
    errorInProcessing: 'Error in processing request',
    errorOTPMismatchOrExpired: 'OTP Mismatch or Expired',
    errorPollAlreadyInGroup: 'Poll already available in the group',
    errorNotAnAdminUser: "You're NOT an Admin user",
    errorPollNotAvailable: 'Poll not available',
};
