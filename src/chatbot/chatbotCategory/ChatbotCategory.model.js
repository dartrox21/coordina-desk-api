const mongoose = require('mongoose');

let Schema = mongoose.Schema;

const ClassificationCategory = new Schema({
    category: {
        type: String,
        maxLength: 200
    },
    createdAt: {
        type: Date, 
        default: Date.now
    }
}, 
{ 
    collection: 'classification_category',
    timestamps: true
});

module.exports = mongoose.model('classification_category', ClassificationCategory);