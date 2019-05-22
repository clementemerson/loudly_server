const https = require('https');
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
var loginProcess = require('../db/loginprocess');
var errors = require('../helpers/errorstousers');
var success = require('../helpers/successtousers');

module.exports = function (app) {

    //this key is for testing purposes
    var api_key = '66b88c13-ed3c-11e8-a895-0200cd936042';

    //Comment: 
    //1. This function gets a phonenumber, verifies it (only an indian number is valid)
    //2. Stores the required info in db
    //3. Sends a reply back to client
    app.get('/getotp/:phonenumber', function (req, res) {
        console.log('came here');
        if (req.params.phonenumber) {
            //check phonenumber param is valid
            var number;
            try {
                number = phoneUtil.parseAndKeepRawInput(req.params.phonenumber);
            } catch(err) {
                res.json(errors.invalidData);
                return;
            }

            if (phoneUtil.isPossibleNumber(number) && phoneUtil.isValidNumber(number) &&
                phoneUtil.isValidNumberForRegion(number, 'IN')) {
                    //phonenumber is valid
                var otpRequestUrl = 'https://2factor.in/API/V1/' + api_key + '/SMS/' + req.params.phonenumber + '/AUTOGEN/PhoneAuthLoudSpeaker';
                console.log(otpRequestUrl);
                https.get(otpRequestUrl, (resp) => {
                    let data = '';

                    // A chunk of data has been recieved.
                    resp.on('data', (chunk) => {
                        data += chunk;
                    });

                    resp.on('end', () => {
                        //Got reply from 2factor
                        var response = JSON.parse(data);
                        var loginInfo = {};
                        loginInfo.session_id = response.Details;
                        loginInfo.phonenumber = req.params.phonenumber;
                        //insert the data in db
                        //loginProcess.insert(loginInfo);
                        //send reply
                        res.json(success.sendData(loginInfo.session_id));
                    });
                }).on("error", (err) => {
                    console.log('2factor error');
                    //error in 2factor
                    res.json(errors.errorInProcessing);
                });
            } else {
                //phonenumber is invalid
                res.json(errors.invalidPhoneNumber);
            }
        } else {
            //phonenumber param is invalid
            res.json(errors.invalidData);
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
                    if(response.Details === 'OTP Matched') {

                    }
                });

                //If matched put an entry in db
                //If not matched, ask them to click resend
            }).on("error", (err) => {
                res.json(errors.errorInProcessing);
            });
        } else {
            res.json(errors.invalidData);
        }
    });
}
