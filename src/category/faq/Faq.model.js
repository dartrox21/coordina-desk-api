const mongoose = require('mongoose');
const CustomErrorMessages = require('../../exceptionHandler/CustomErrorMessages');


const Schema = mongoose.Schema;

const Faq = new Schema({
    question: {
        type: String,
        required:[true, CustomErrorMessages.FIELD_MAY_NOT_BE_EMPTY],
        maxLength: 500
    },
    answer: {
        type: String,
        required:[true, CustomErrorMessages.FIELD_MAY_NOT_BE_EMPTY],
        maxLength: 100000
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
    },
    order: {
        type: Number,
        required: [true, CustomErrorMessages.FIELD_MAY_NOT_BE_EMPTY]
    }
},
{
    collection: 'faq'
});

const autoPopulateCategory = function(next) {
    this.populate('category');
    next();
};

Faq.pre('find', autoPopulateCategory)

module.exports = mongoose.model('faq', Faq);
