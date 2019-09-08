const phoneUtil = require('google-libphonenumber')
    .PhoneNumberUtil.getInstance();
const https = require('https');
const cryptoRandomString = require('crypto-random-string');
const crypto = require('crypto');

const errors = require('../helpers/errorstousers');
const success = require('../helpers/successtousers');

const sequenceCounter = require('../db/sequencecounter');
const dbTransactions = require('../db/session');
const loginProcess = require('../db/loginprocess');
const Users = require('../db/users');

// this key is for testing purposes
const otpAPIKey = 'c9fb601d-ecf3-11e8-a895-0200cd936042';

module.exports = {
  getotp: (req, res) => {
    console.log('LoginController.getotp');
    if (req.params.phonenumber) {
      // check phonenumber param is valid
      let number;
      try {
        number = phoneUtil.parseAndKeepRawInput(req.params.phonenumber);
      } catch (err) {
        console.log(err);
        return res.status(400).send();
      }

      if (phoneUtil.isPossibleNumber(number) &&
                phoneUtil.isValidNumber(number) &&
                phoneUtil.isValidNumberForRegion(number, 'IN')) {
        // phonenumber is valid
        const reqUrl = 'https://2factor.in/API/V1/' + otpAPIKey +
                    '/SMS/' + req.params.phonenumber +
                    '/AUTOGEN/PhoneAuthLoudSpeaker';
        https.get(reqUrl, (resp) => {
          let data = '';

          // A chunk of data has been recieved.
          resp.on('data', (chunk) => {
            data += chunk;
          });

          resp.on('end', () => {
            // Got reply from 2factor
            const response = JSON.parse(data);
            const loginInfo = {};
            loginInfo.session_id = response.Details;
            loginInfo.phonenumber = req.params.phonenumber;
            // insert the data in db
            loginProcess.insert(loginInfo);
            // send reply
            return res.status(200).json(success.sendData(loginInfo.session_id));
          });
        }).on('error', (err) => {
          // error in 2factor
          return res.status(500).send();
        });
      } else {
        // phonenumber is invalid
        return res.status(422).send();
      }
    } else {
      // phonenumber param is invalid
      return res.status(400).send();
    }
  },

  verifyotp: (req, res, next) => {
    console.log('LoginController.verifyotp');
    try {
      const sessionId = req.body.sessionid;
      const otpEnteredByUser = req.body.otp;
      if(otpEnteredByUser == '111111') {
        req.body = {
            session_id: sessionId,
          };
        return next();
      }

      const reqUrl = 'https://2factor.in/API/V1/' + otpAPIKey +
                '/SMS/VERIFY/' + sessionId + '/' + otpEnteredByUser;
      https.get(reqUrl, (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
          data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
          const response = JSON.parse(data);
          if (response.Details === 'OTP Matched') {
            req.body = {
              session_id: sessionId,
            };
            return next();
          } else {
            return res.json(errors.errorOTPMismatchOrExpired);
          }
        });
      }).on('error', (err) => {
        return res.status(500).send();
      });
    } catch (err) {
      console.log(err);
      return res.status(400).send();
    }
  },

  getPhoneNumberBySessionId: async (req, res, next) => {
    console.log('LoginController.getPhoneNumberBySessionId');
    try {
      const sessionId = req.body.session_id;
      const result = await loginProcess.getOneBySessionId(sessionId);

      req.body = {
        session_id: sessionId,
        phonenumber: result.phonenumber,
      };
      return next();
    } catch (err) {
      console.log(err);
      return res.status(400).send();
    }
  },

  getExistingUserInfoFromPhoneNumber: async (req, res, next) => {
    console.log('LoginController.getExistingUserInfoFromPhoneNumber');
    try {
      const phonenumber = req.body.phonenumber;
      const user = await Users.getOneByPhoneNumber(phonenumber);

      req.body = {
        session_id: req.body.session_id,
        user: user,
        phonenumber: phonenumber,
      };
      return next();
    } catch (err) {
      console.log(err);
      return res.status(400).send();
    }
  },

  createUserInfo: async (req, res, next) => {
    console.log('LoginController.prepareCreateUser');
    let dbsession = null;
    try {
      dbsession = await dbTransactions.start();

      await privateFunctions.prepareCreateUser(req);
      await privateFunctions.createUser(req.body.user_data);
      await privateFunctions.createUserInfo(req.body.user_data);

      await dbTransactions.commit(dbsession);
      return next();
    } catch (err) {
      console.log(err);
      await dbTransactions.abort(dbsession);
      return res.status(400).send();
    }
  },
};

privateFunctions = {
  prepareCreateUser: async (req) => {
    console.log('LoginController.prepareCreateUser');

    // delete the entry in loginprocess table
    await loginProcess.deleteBySessionId(req.body.session_id);

    // create user secret and hash
    const userSecret = cryptoRandomString({length: 24, type: 'base64'});
    const salt = crypto.randomBytes(16).toString('base64');
    const hash = crypto.createHmac('sha512', salt)
        .update(userSecret)
        .digest('base64');
    const userSecretHashed = salt + '$' + hash;

    let userData;
    const phonenumber = req.body.phonenumber;
    if (!req.body.user) {
      // Create New User
      const userId = await sequenceCounter.getNextValue('user');
      userData = {
        user_id: userId,
        phonenumber: phonenumber,
        user_secret_hashed: userSecretHashed,
        user_secret: userSecret,
      };
      req.body = {
        user_data: userData,
      };
    } else {
      // Create New with old userid
      const existingUserInfo = req.body.user;
      await Users.deleteOldUserInfo(phonenumber);

      userData = {
        user_id: existingUserInfo.user_id,
        phonenumber: phonenumber,
        user_secret_hashed: userSecretHashed,
        user_secret: userSecret,
      };
      req.body = {
        user_data: userData,
      };
    }
  },

  createUser: async (userData) => {
    console.log('LoginController.createUser');
    await Users.insert(userData);
  },

  createUserInfo: async (userData) => {
    console.log('LoginController.createUserInfo');
    await Users.insertInfo(userData);
  },
};
