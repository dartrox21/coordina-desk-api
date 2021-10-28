const mongoose = require('mongoose');
const AutoIncrementFactory = require('mongoose-sequence');
const ConfigurationModel = require('./configuration.model');


mongoose.set('useNewUrlParser',true);
mongoose.set('useCreateIndex',true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('debug', true);


/**
 * DeprecationWarning: Mongoose: `findOneAndUpdate()` and `findOneAndDelete()` without the
 * `useFindAndModify` option set to false are deprecated. 
 * See: https://mongoosejs.com/docs/deprecations.html#findandmodify
 */
mongoose.set('useFindAndModify', false);

(async function connect() {
    const connection = await mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.BD_URI}?retryWrites=true&w=majority`)
        .catch(err => console.log(`DB connection ERROR: ${err}`));
    const AutoIncrement = AutoIncrementFactory(connection);
    let configurationKeys = await ConfigurationModel.find();
    if(configurationKeys.length < 1) {
        console.log('CREATING CONFIGURATION KEYS');
        await ConfigurationModel.create({configKey: {isTrained: false}});
    }
})();

/**
 * Connection ready state 
 * 0 = disconnected 
 * 1 = connected 
 * 2 = connecting 
 * 3 = disconnecting 
 * Each state change emits its associated event name.
 */
console.log(`Mongoose connection state: ${mongoose.connection.readyState}`);
