const mongoose = require('mongoose');
const CustomErrorMessages = require('../../exceptionHandler/CustomErrorMessages');


const Schema = mongoose.Schema;

const Faq = new Schema({
    question: {
        type: String,
        required:[true, CustomErrorMessages.FIELD_MAY_NOT_BE_EMPTY]
    },
    answer: {
        type: String,
        required:[true, CustomErrorMessages.FIELD_MAY_NOT_BE_EMPTY]
    },
    isActive: {
        type: Boolean,
        default: false,
        required: true,
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'category',
        required: [true, CustomErrorMessages.FIELD_MAY_NOT_BE_EMPTY]
    }
},
{
    collection: 'faq'
});

module.exports = mongoose.model('faq', Faq);