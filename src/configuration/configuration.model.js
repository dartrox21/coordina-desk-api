const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let Configuration = new Schema({
    configKey: {
        type: Object
    }
},
{
    collection: 'configuration'
});

module.exports = mongoose.model('configuration', Configuration);
