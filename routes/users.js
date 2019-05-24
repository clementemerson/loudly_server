let jwtController = require('../controllers/jwtController');
let UserController = require('../controllers/UserController');

module.exports = function(app) {
    app.post('/users/byphonenumbers', [
        jwtController.validJWTNeeded,
        jwtController.validJWTDataNeeded,
        UserController.getUsersByPhoneNumbers
    ]);
}