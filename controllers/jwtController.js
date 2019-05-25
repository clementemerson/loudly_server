var jwt = require('jsonwebtoken');
var crypto = require('crypto');

var jwtSecret = 'ABCD';

var Users = require('../db/users');
var errors = require('../helpers/errorstousers');


module.exports = {
    validJWTNeeded: (req, res, next) => {
        if (req.headers['authorization']) {
            try {
                let authorization = req.headers['authorization'].split(' ');
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
        let token = req.urlparams.token;
        if (token) {
            try {
                let jwtDetails = jwt.verify(token, jwtSecret);
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
            let user_secret = req.jwtDetails.user_secret;
            let phonenumber = req.jwtDetails.user_phonenumber;

            let user = await Users.getOneByPhoneNumber(phonenumber);
            let user_secret_splited = user.user_secret.split('$');

            let hash = crypto.createHmac('sha512', user_secret_splited[0])
                .update(user_secret)
                .digest("base64");

            if (hash != user_secret_splited[1]) {
                return false;
            }
            return true;
        } catch (err) {
            return false;
        }
    },

    validJWTDataNeeded: async (req, res, next) => {
        try {
            let user_secret = req.jwt.user_secret;
            let phonenumber = req.jwt.user_phonenumber;

            let user = await Users.getOneByPhoneNumber(phonenumber);
            let user_secret_splited = user.user_secret.split('$');

            let hash = crypto.createHmac('sha512', user_secret_splited[0])
                .update(user_secret)
                .digest("base64");

            if (hash != user_secret_splited[1]) {
                return res.status(403).send();
            }
            return next();
        } catch (err) {
            return res.json(errors.errorInProcessing);
        }
    },

    signjwt: (req, res, next) => {
        if (req.body.user_data) {
            var user_data = req.body.user_data;
            var user_data_jwt = {
                user_id: user_data.user_id,
                user_secret: user_data.user_secret,
                user_phonenumber: user_data.phonenumber
            }
            let token = jwt.sign(user_data_jwt, jwtSecret);
            res.status(201).send({ token: token });
        } else {
            return res.json(errors.errorInProcessing);
        }
    }
}