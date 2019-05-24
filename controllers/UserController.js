var success = require('../helpers/successtousers');
var Users = require('../db/users');

module.exports = {
    getUsersByPhoneNumbers: async (req, res) => {
        let phoneNumbers = req.body.phoneNumbers;

        let users = await Users.getUsersByPhoneNumbers(phoneNumbers);
        res.status(200).send({ userslist: users });
    }
}