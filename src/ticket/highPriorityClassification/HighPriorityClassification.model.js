const mongoose = require('mongoose');
const CustomErrorMessages = require('../../exceptionHandler/CustomErrorMessages');


const Schema = mongoose.Schema;

/**
 * The high classifications are key words that affect the classification of a ticket
 * if a ticket has one of this classifications it might be set up as a HIGH priority 
 */
const HighPriorityClassification = new Schema({
    keyword: {
        type: String,
        required: [true, CustomErrorMessages.FIELD_MAY_NOT_BE_EMPTY],
        maxLength: 200
    }
},{
    collection: 'high_priority_classification',
});

module.exports = mongoose.model('high_priority_classification', HighPriorityClassification);