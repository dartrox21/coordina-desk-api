const mongoose = require('mongoose');

let Schema = mongoose.Schema;

const ChatbotFile = new Schema({
    name: {
        type: String,
    },
    file: {
        type: Buffer
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
    collection: 'chatbot_file',
    timestamps: true
});


module.exports = mongoose.model('chatbot_file', ChatbotFile);