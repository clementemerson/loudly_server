const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const https = require('https');
const uuidv4 = require('uuid/v4');
const cryptoRandomString = require('crypto-random-string');
var crypto = require('crypto');

var dbTransactions = require('../db/session');
var loginProcess = require('../db/loginprocess');
var Users = require('../db/users');

var errors = require('../helpers/errorstousers');
var success = require('../helpers/successtousers');


//this key is for testing purposes
var api_key = 'c9fb601d-ecf3-11e8-a895-0200cd936042';

module.exports = {
    getotp: (req, res) => {

        console.log('LoginController.getotp');
        if (req.params.phonenumber) {
            //check phonenumber param is valid
            var number;
            try {
                number = phoneUtil.parseAndKeepRawInput(req.params.phonenumber);
            } catch (err) {
                return res.json(errors.invalidData);
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
                        loginProcess.insert(loginInfo);
                        //send reply
                        return res.json(success.sendData(loginInfo.session_id));
                    });
                }).on("error", (err) => {
                    //error in 2factor
                    return res.json(errors.errorInProcessing);
                });
            } else {
                //phonenumber is invalid
                return res.json(errors.invalidPhoneNumber);
            }
        } else {
            //phonenumber param is invalid
            return res.json(errors.invalidData);
        }
    },

    verifyotp: (req, res, next) => {
        console.log('LoginController.verifyotp');
        try {
            console.log(req.body);
            var session_id = req.body.sessionid;
            var otp_entered_by_user = req.body.otp;

            var otpRequestUrl = 'https://2factor.in/API/V1/' + api_key + '/SMS/VERIFY/' + session_id + '/' + otp_entered_by_user;
            console.log(otpRequestUrl);
            https.get(otpRequestUrl, (resp) => {
                let data = '';

                // A chunk of data has been recieved.
                resp.on('data', (chunk) => {
                    data += chunk;
                });

                // The whole response has been received. Print out the result.
                resp.on('end', () => {
                    var response = JSON.parse(data);
                    console.log(response);
                    if (response.Details === 'OTP Matched') {
                        req.body = {
                            session_id: session_id
                        };
                        return next();
                    } else {
                        return res.json(errors.errorOTPMismatchOrExpired);
                    }
                });
            }).on("error", (err) => {
                return res.json(errors.errorInProcessing);
            });
        } catch (err) {
            return res.json(errors.errorInProcessing);
        }
    },

    getPhoneNumberBySessionId: async (req, res, next) => {
        console.log('LoginController.getPhoneNumberBySessionId');
        try {
            var session_id = req.body.session_id;
            var result = await loginProcess.getOneBySessionId(session_id);

            req.body = {
                session_id: session_id,
                phonenumber: result.phonenumber
            };
            return next();
        } catch (err) {
            return res.json(errors.errorInProcessing);
        }
    },

    getExistingUserInfoFromPhoneNumber: async (req, res, next) => {
        console.log('LoginController.getExistingUserInfoFromPhoneNumber');
        try {
            var phonenumber = req.body.phonenumber;
            var user = await Users.getOneByPhoneNumber(phonenumber);

            req.body = {
                session_id: req.body.session_id,
                user: user,
                phonenumber: phonenumber
            }
            return next();
        } catch (err) {
            return res.json(errors.errorInProcessing);
        }
    },

    createUserInfo: async (req, res, next) => {
        console.log('LoginController.prepareCreateUser');
        var dbsession;
        try {
            dbsession = await dbTransactions.startSession();
            dbsession.startTransaction();

            await privateFunctions.prepareCreateUser(req);
            await privateFunctions.createUser(req.body.user_data);
            await privateFunctions.createUserInfo(req.body.user_data);

            await dbTransactions.commitTransaction(dbsession);
            return next();
        } catch (err) {
            console.log(err);
            await dbTransactions.abortTransaction(dbsession);
            return res.json(errors.errorInProcessing);
        }
    },
}

privateFunctions = {
    prepareCreateUser: async (req) => {
        console.log('LoginController.prepareCreateUser');

        //delete the entry in loginprocess table
        await loginProcess.deleteBySessionId(req.body.session_id);

        //create user secret and hash
        var user_secret = cryptoRandomString({ length: 24, type: 'base64' });
        let salt = crypto.randomBytes(16).toString('base64');
        let hash = crypto.createHmac('sha512', salt)
            .update(user_secret)
            .digest("base64");
        var user_secret_hashed = salt + "$" + hash;

        var user_data;
        var phonenumber = req.body.phonenumber;
        if (!req.body.user) {
            //Create New User
            user_data = {
                user_id: uuidv4(),
                phonenumber: phonenumber,
                user_secret_hashed: user_secret_hashed,
                user_secret: user_secret
            };
            req.body = {
                user_data: user_data
            }
        } else {

            //Create New with old userid
            var existingUserInfo = req.body.user;
            await Users.deleteOldUserInfo(phonenumber);

            user_data = {
                user_id: existingUserInfo.user_id,
                phonenumber: phonenumber,
                user_secret_hashed: user_secret_hashed,
                user_secret: user_secret
            };
            req.body = {
                user_data: user_data
            }
        }
    },

    createUser: async (user_data) => {
        console.log('LoginController.createUser');
        await Users.insert(user_data);
    },

    createUserInfo: async (user_data) => {
        console.log('LoginController.createUserInfo');
        await Users.insertInfo(user_data);
    },
}