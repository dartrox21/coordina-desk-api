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
    },
    tickets: {
        type: [{
            type: Number,
            ref: 'ticket'
        }],
        default: [],
        required: true
    }
}, 
{ 
    collection: 'user',
    timestamps: true
});

User.set('toObject', { virtuals: true, transform: function(doc, ret){delete ret.tickets} });
User.set('toJSON', { virtuals: true, transform: function(doc, ret){delete ret.tickets} });

User.virtual('ticketsCount').get(function() {
    if(this.tickets) {
        return this.tickets.length;
    }
    return 0;
});

User.plugin(uniqueValidator, {
    message: CustomErrorMessages.MUST_BE_UNIQUE
});

module.exports = mongoose.model('user', User);
