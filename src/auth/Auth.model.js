const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const CustomErrorMessages = require('../exceptionHandler/CustomErrorMessages');

let Schema = mongoose.Schema;

let Auth = new Schema({
    email: {
        type: String,
        required: [true, CustomErrorMessages.FIELD_MAY_NOT_BE_EMPTY]
    },
    password: {
        type: String,
        required: [true, CustomErrorMessages.FIELD_MAY_NOT_BE_EMPTY]
    }
});

Auth.plugin(uniqueValidator, {
    message: CustomErrorMessages.MUST_BE_UNIQUE
});

module.exports = mongoose.model('auth', Auth);
