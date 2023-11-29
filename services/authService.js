const bcrypt = require('bcrypt');
const saltRounds = 10;
const UsersModel = require('../models/usersModel');

const authService = {
    getUserByEmail: async function (email) {
        const isEmailExists = await UsersModel.checkEmailExistence(email);
        return isEmailExists;
      },
};

module.exports = authService;
