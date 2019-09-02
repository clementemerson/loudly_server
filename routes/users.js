const jwtController = require('../controllers/jwtController');
const UserController = require('../controllers/UserController');

module.exports = function(app) {
  app.post('/users/byphonenumbers', [
    jwtController.validJWTNeeded,
    jwtController.validJWTDataNeeded,
    UserController.getUsersByPhoneNumbers,
  ]);
};
