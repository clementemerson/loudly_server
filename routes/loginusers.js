
var LoginController = require('../controllers/LoginController');
var jwtController = require('../controllers/jwtController');

const asyncMiddleware = fn =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
  };

module.exports = function (app) {
    //Comment: 
    //1. This function gets a phonenumber, verifies it (only an indian number is valid)
    //2. Stores the required info in db
    //3. Sends a reply back to client
    app.get('/getotp/:phonenumber', [
        LoginController.getotp
    ]);

    app.get('/verifyotp_login/:sessionid/:otp', [
        LoginController.verifyotp,
        asyncMiddleware(LoginController.getPhoneNumberBySessionId),
        asyncMiddleware(LoginController.getExistingUserInfoFromPhoneNumber),
        asyncMiddleware(LoginController.prepareCreateUser),
        asyncMiddleware(LoginController.createUser),
        jwtController.signjwt,
    ]);
}
