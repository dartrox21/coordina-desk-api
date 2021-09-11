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
        type: String,
        required: [false, CustomErrorMessages.FIELD_MAY_NOT_BE_EMPTY]
    },
    name: {
        type: String,
        required: [false, CustomErrorMessages.FIELD_MAY_NOT_BE_EMPTY]
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

/**
 * Previous a user creation the password will be encripted
 */
// User.pre('save', async function () {
//     const user = this;
//     const hash = await encrypt(user.password);
//     user.password = hash;
// });

module.exports = mongoose.model('user', User);
