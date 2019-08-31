const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const jwtSecret = 'ABCD';

const Users = require('../db/users');
const success = require('../helpers/successtousers');


module.exports = {
  validJWTNeeded: (req, res, next) => {
    if (req.headers['authorization']) {
      try {
        const authorization = req.headers['authorization'].split(' ');
        if (authorization[0] !== 'Bearer') {
          return res.status(401).send();
        } else {
          req.jwt = jwt.verify(authorization[1], jwtSecret);
          return next();
        }
      } catch (err) {
        return res.status(403).send();
      }
    } else {
      return res.status(401).send();
    }
  },

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
      const userSecret = req.jwtDetails.user_secret;
      const phonenumber = req.jwtDetails.user_phonenumber;

      const user = await Users.getOneByPhoneNumber(phonenumber);
      const userSecretSplitted = user.user_secret.split('$');

      const hash = crypto.createHmac('sha512', userSecretSplitted[0])
          .update(userSecret)
          .digest('base64');

      if (hash != userSecretSplitted[1]) {
        return false;
      }
      return true;
    } catch (err) {
      return false;
    }
  },

  validJWTDataNeeded: async (req, res, next) => {
    try {
      const userSecret = req.jwt.user_secret;
      const phonenumber = req.jwt.user_phonenumber;

      const user = await Users.getOneByPhoneNumber(phonenumber);
      const userSecretSplitted = user.user_secret.split('$');

      const hash = crypto.createHmac('sha512', userSecretSplitted[0])
          .update(userSecret)
          .digest('base64');

      if (hash != userSecretSplitted[1]) {
        return res.status(403).send();
      }
      return next();
    } catch (err) {
      return res.status(500).send();
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
