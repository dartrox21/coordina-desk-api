const mongoose = require('mongoose');

let Schema = mongoose.Schema;

const Chatbot = new Schema({
    input: {
        type: String,
        maxLength: 200
    },
    createdAt: {
        type: Date, 
        default: Date.now
    }
}, 
{ 
    collection: 'chatbot',
    timestamps: true
});

module.exports = mongoose.model('chatbot', Chatbot);