var jwt = require('jsonwebtoken');
var jwtSecret = 'ABCD';


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