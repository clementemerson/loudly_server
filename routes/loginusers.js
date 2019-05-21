const https = require('https');
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

module.exports = function (app) {

    //this key is for testing purposes
    var api_key = '66b88c13-ed3c-11e8-a895-0200cd936042';

    app.get('/getotp/:phonenumber:/deviceid', function (req, res) {
        console.log('came here');
        if (req.params.phonenumber) {

            // Result from isPossibleNumber().
            const number = phoneUtil.parseAndKeepRawInput(req.params.phonenumber);
            if (phoneUtil.isPossibleNumber(number) && phoneUtil.isValidNumber(number) &&
                phoneUtil.isValidNumberForRegion(number, 'IN')) {
                var otpRequestUrl = 'https://2factor.in/API/V1/' + api_key + '/SMS/' + req.params.phonenumber + '/AUTOGEN/PhoneAuthLoudSpeaker';
                console.log(otpRequestUrl);
                https.get(otpRequestUrl, (resp) => {
                    let data = '';
                    // The whole response has been received. Print out the result.
                    resp.on('end', () => {
                        var response = JSON.parse(data);
                        res.end(data);
                    });
                }).on("error", (err) => {
                    var error = {};
                    error.Status = 'Error';
                    error.Details = 'Error in OTP Provider';
                    res.json(error);
                });

            } else {
                var error = {};
                error.Status = 'Error';
                error.Details = 'Invalid phone number';
                res.json(error);
            }
        } else {
            var error = {};
            error.Status = 'Error';
            error.Details = 'Invalid Data';
            res.json(error);
        }
    });

    app.get('/verifyotp_login/:sessionid/:otp', function (req, res) {
        console.log('came here');
        if (req.params.sessionid && req.params.otp) {

            var session_id = req.params.sessionid;
            var otp_entered_by_user = req.params.otp;
            
            var otpRequestUrl = 'https://2factor.in/API/V1/' + api_key + '/SMS/VERIFY/' + session_id + '/' + otp_entered_by_user;
            console.log(otpRequestUrl);
            https.get(otpRequestUrl, (resp) => {
                let data = '';

                // A chunk of data has been recieved.
                resp.on('data', (chunk) => {
                    data += chunk;
                    console.log(data);
                });

                // The whole response has been received. Print out the result.
                resp.on('end', () => {
                    var response = JSON.parse(data);
                    res.end(response.Details);
                });

                //If matched put an entry in db
                //If not matched, ask them to click resend
            }).on("error", (err) => {
                var error = {};
                error.Status = 'Error';
                error.Details = 'Error in OTP Provider';
                res.json(error);
            });
        } else {
            var error = {};
            error.Status = 'Error';
            error.Details = 'Invalid Data';
            res.json(error);
        }
    });
}