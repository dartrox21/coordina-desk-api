const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const CustomErrorMessages = require('../exceptionHandler/CustomErrorMessages');
const ROLES = require('../role/Role.enum');

let Schema = mongoose.Schema;

let validRoles = {
    values: [ROLES.COORDINATOR, ROLES.ASSISTANT],
    message: CustomErrorMessages.INVALID_ROLE
}

let User = new Schema({
    email: {
        type: String,
        required: [true, CustomErrorMessages.FIELD_MAY_NOT_BE_EMPTY],
        unique: true
    },
    password: {
        type: String
    },
    name: {
        type: String
    },
    isActive: {
        type: Boolean,
        required: true,
        default: false
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false
    },
    role: {
        type: String,
        required: false,
        enum: validRoles
    }
}, 
{ 
    collection: 'user' 
});

User.plugin(uniqueValidator, {
    message: CustomErrorMessages.MUST_BE_UNIQUE
});

module.exports = mongoose.model('user', User);
