const mongoose = require('mongoose');

let Schema = mongoose.Schema;

const ChatbotCategory = new Schema({
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
    collection: 'chatbot_category',
    timestamps: true
});

module.exports = mongoose.model('chatbot_category', ChatbotCategory);