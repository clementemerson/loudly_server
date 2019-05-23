const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const https = require('https');
const uuidv4 = require('uuid/v4');
const cryptoRandomString = require('crypto-random-string');

var dbTransactions = require('../db/session');
var loginProcess = require('../db/loginprocess');
var Users = require('../db/users')

var errors = require('../helpers/errorstousers');
var success = require('../helpers/successtousers');


//this key is for testing purposes
var api_key = '66b88c13-ed3c-11e8-a895-0200cd936042';

module.exports = {
    getotp: (req, res) => {

        console.log('came here');
        console.log(req.params.phonenumber);
        if (req.params.phonenumber) {
            //check phonenumber param is valid
            var number;
            try {
                number = phoneUtil.parseAndKeepRawInput(req.params.phonenumber);
            } catch (err) {
                console.log('error');
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
                    console.log('2factor error');
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
        try {
            console.log('verifyotp');
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
                        if (response.Details === 'OTP Matched') {
                            req.body = {
                                session_id: session_id
                            };
                            return next();
                        }
                    });
                }).on("error", (err) => {
                    return res.json(errors.errorInProcessing);
                });
            } else {
                return res.json(errors.invalidData);
            }
        } catch (err) {
            return res.json(errors.errorInProcessing);
        }
    },

    getPhoneNumberBySessionId: async (req, res, next) => {
        try {
            if (req.body.sessionid) {
                var session_id = req.body.sessionid;
                var result = await loginProcess.getOneByOTPSessionId(session_id);

                if (result === null) {
                    return res.json(errors.errorInProcessing);
                } else {
                    req.body = {
                        phonenumber: result.phonenumber
                    };
                    return next();
                }
            } else {
                return res.json(errors.errorInProcessing);
            }
        } catch (err) {
            return res.json(errors.errorInProcessing);
        }
    },

    getExistingUserInfoFromPhoneNumber: async (req, res, next) => {
        try {
            if (req.body.phonenumber) {
                var phonenumber = req.body.phonenumber;
                var user = await Users.getOneByPhoneNumber(phonenumber);
                req.body = {
                    user: user,
                    phonenumber: phonenumber
                }
                return next();
            } else {
                return res.json(errors.errorInProcessing);
            }
        } catch (err) {
            return res.json(errors.errorInProcessing);
        }
    },

    prepareCreateUser: async (req, res, next) => {
        const dbsession = dbTransactions.startSession();
        try {
            if (req.body.phonenumber) {
                var phonenumber = req.body.phonenumber;
                //create user secret and hash
                var user_secret = cryptoRandomString({ length: 24, type: 'base64' });
                let salt = crypto.randomBytes(16).toString('base64');
                let hash = crypto.createHmac('sha512', salt)
                    .update(user_secret)
                    .digest("base64");
                var user_secret_hashed = salt + "$" + hash;

                var user_data;
                if (req.body.user === null) {
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
                    return next();
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
                        user_data: user_data,
                        dbsession: dbsession
                    }
                    return next();
                }
            } else {
                return res.json(errors.errorInProcessing);
            }
        } catch (err) {
            await dbTransactions.abortTransaction(dbsession);
            return res.json(errors.errorInProcessing);
        }
    },

    createUser: async (req, res, next) => {
        var dbsession = req.body.dbsession;
        if (!dbsession) {
            dbsession = dbTransactions.startSession();
        }

        try {
            if (req.body.user_data) {
                var user_data = req.body.user_data;

                await Users.insert(user_data);
                await dbTransactions.commitTransaction(dbsession);
                return next();
            } else {
                if (dbsession) {
                    await dbTransactions.abortTransaction(dbsession);
                }
                return res.json(errors.errorInProcessing);
            }
        } catch (err) {
            await dbTransactions.abortTransaction(dbsession);
            return res.json(errors.errorInProcessing);
        }
    },

    
}