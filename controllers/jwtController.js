const jwt = require('jsonwebtoken');
const safeCompare = require('safe-compare');
const bcrypt = require('bcrypt');

const jwtSecret = 'ABCD';

const Users = require('../db/users');
const success = require('../helpers/successtousers');

module.exports = {
  validateJwt: (req) => {
    const token = req.urlparams.token;
    if (token) {
      try {
        const jwtDetails = jwt.verify(token, jwtSecret);
        req.jwtDetails = jwtDetails;
        return true;
      } catch (err) {
        return false;
      }
    } else {
      return false;
    }
  },

  validateJwtData: async (req) => {
    try {
      const secretFromUser = req.jwtDetails.user_secret;
      const phonenumber = req.jwtDetails.user_phonenumber;

      const user = await Users.getOneByPhoneNumber(phonenumber);
      return await bcrypt.compare(secretFromUser, user.user_secret);
    } catch (err) {
      return false;
    }
  },

  signjwt: (req, res, next) => {
    if (req.body.user_data) {
      const userData = req.body.user_data;
      const userDataJWT = {
        user_id: userData.user_id,
        user_secret: userData.user_secret,
        user_phonenumber: userData.phonenumber,
      };
      const token = jwt.sign(userDataJWT, jwtSecret);

      // Prepare data to send
      const data = {
        token: token,
        user_id: userDataJWT.user_id,
      };
      return res.status(200).json(success.sendData(data));
    } else {
      return res.status(500).send();
    }
  },
};
