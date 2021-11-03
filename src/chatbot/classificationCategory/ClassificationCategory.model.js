const mongoose = require('mongoose');
const CustomErrorMessages = require('../../exceptionHandler/CustomErrorMessages');

let Schema = mongoose.Schema;

const ClassificationCategory = new Schema({
    category: {
        type: String,
        maxLength: [200, CustomErrorMessages.MAX_LENGTH],
        unique: true,
        required: [true, CustomErrorMessages.FIELD_MAY_NOT_BE_EMPTY]
    },
    keywords: {
        type: String,
        maxLength: 500,
        required: [true, CustomErrorMessages.FIELD_MAY_NOT_BE_EMPTY]
    },
    total: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date, 
        default: Date.now
    },
    updatedAt: {
        type: Date, 
        default: Date.now
    }
}, 
{ 
    collection: 'classification_category',
    timestamps: true
});

module.exports = mongoose.model('classification_category', ClassificationCategory);