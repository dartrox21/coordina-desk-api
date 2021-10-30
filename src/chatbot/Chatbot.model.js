const mongoose = require('mongoose');
const mongooseToCsv = require('mongoose-to-csv');


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


Chatbot.plugin(mongooseToCsv, {
    headers: 'Input CreatedAt',
    constraints: {
      'Input': 'input',
      'CreatedAt': 'createdAt'
    }
  });

module.exports = mongoose.model('chatbot', Chatbot);