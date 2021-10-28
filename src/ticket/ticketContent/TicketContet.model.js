const mongoose = require('mongoose');
const CustomErrorMessages = require('../../exceptionHandler/CustomErrorMessages');

let Schema = mongoose.Schema;

let TicketContent = new Schema({
    username: {
        type: String,
        required: [true, CustomErrorMessages.FIELD_MAY_NOT_BE_EMPTY],
        maxLength: 200
    },
    data: {
        type: String,
        required: [true, CustomErrorMessages.FIELD_MAY_NOT_BE_EMPTY],
        maxLength: 1000
    },
    created_at: {
        type: Date, 
        default: Date.now
    },
    isUser: {
        type: Boolean,
        required: true
    }
},
{
    collection: 'ticket_content'
});

module.exports = mongoose.model('ticket_content', TicketContent);