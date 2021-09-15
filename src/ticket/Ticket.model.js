const mongoose = require('mongoose');
const CustomErrorMessages = require("../exceptionHandler/CustomErrorMessages");
const STATUS = require('./Status.enum');
const PRIORITY = require('./Priority.enum');
const AutoIncrement = require('mongoose-sequence')(mongoose);


const validStatus = {
    values: [STATUS.WAITING_ASIGNATION, STATUS.ASIGNED, STATUS.IN_PROGRESS, STATUS.WAITING_RESPONSE, STATUS.RESOLVE, STATUS.FINAL_RESOLVE],
    message: CustomErrorMessages.INVALID_STATUS
};

const validPriority = {
    values: [PRIORITY.LOW, PRIORITY.MODERATE, PRIORITY.HIGH],
    message: CustomErrorMessages.INVALID_PRIORITY
};

let Schema = mongoose.Schema;

let Ticket = new Schema({
    _id: {
        type: Number
    },
    title: {
        type: String,
        required: [true, CustomErrorMessages.FIELD_MAY_NOT_BE_EMPTY]
    },
    description: {
        type: String,
        required: [true, CustomErrorMessages.FIELD_MAY_NOT_BE_EMPTY]
    },
    name: {
        type: String,
        required: [true, CustomErrorMessages.FIELD_MAY_NOT_BE_EMPTY]
    },
    udgId: {
        type: Number,
        required: [true, CustomErrorMessages.FIELD_MAY_NOT_BE_EMPTY]
    },
    email: {
        type: String,
        required: [true, CustomErrorMessages.FIELD_MAY_NOT_BE_EMPTY]
    },
    phone: {
        type: Number
    },
    status: {
        type: String,
        required: true,
        enum: validStatus,
        default: STATUS.WAITING_ASIGNATION
    },
    ticketContent: [{
        type: Schema.Types.ObjectId,
        ref: 'ticket_content'
    }],
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    priority: {
        type: String,
        enum: validPriority
    }
},
{
    timestamps: true,
    collection: 'ticket',
    _id: false
});

const autoPopulateTicketContent = function(next) {
    this.populate('ticketContent');
    next();
};

const autoPopulateUser = function(next) {
    this.populate('user');
    next();
}

Ticket.pre('findById', autoPopulateTicketContent)
    .pre('findOne', autoPopulateTicketContent)
    .pre('find', autoPopulateTicketContent);

Ticket.pre('find', autoPopulateUser);

//  This id is the one that will be used by the user && students
Ticket.plugin(AutoIncrement);

module.exports = mongoose.model('ticket', Ticket);