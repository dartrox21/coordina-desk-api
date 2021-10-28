const mongoose = require('mongoose');
const CustomErrorMessages = require('../exceptionHandler/CustomErrorMessages');

let Schema = mongoose.Schema;

const Category = new Schema({
    category: {
        type: String,
        required:[true, CustomErrorMessages.FIELD_MAY_NOT_BE_EMPTY],
        unique: true,
        maxLength: 200
    },
    isActive: {
        type: Boolean,
        required: true,
        default: false
    }
},
{
    collection: 'category'
});

module.exports = mongoose.model('category', Category);