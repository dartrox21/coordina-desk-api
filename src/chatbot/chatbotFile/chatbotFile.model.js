const mongoose = require('mongoose');

let Schema = mongoose.Schema;

const ChatbotFile = new Schema({
    name: {
        type: String,
    },
    file: {
        type: Buffer
    }
}, 
{ 
    collection: 'chatbot_file',
    timestamps: true
});


module.exports = mongoose.model('chatbot_file', ChatbotFile);