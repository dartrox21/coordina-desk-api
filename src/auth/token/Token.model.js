const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const CustomErrorMessages = require('../../exceptionHandler/CustomErrorMessages');

let Schema = mongoose.Schema;

let Token = new Schema({
    token: {
        type: String,
        required: [true, CustomErrorMessages.FIELD_MAY_NOT_BE_EMPTY]
    }
});

Token.plugin(uniqueValidator, {
    message: CustomErrorMessages.MUST_BE_UNIQUE
});

module.exports = mongoose.model('token', Token);