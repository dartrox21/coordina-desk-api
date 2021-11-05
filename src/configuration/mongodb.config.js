const mongoose = require('mongoose');
const AutoIncrementFactory = require('mongoose-sequence');
const ConfigurationModel = require('./configuration.model');
const Category = require('../category/Category.model');
const ClassificationCategory = require('../chatbot/classificationCategory/ClassificationCategory.model');
const HighPriorityClassification = require('../ticket/highPriorityClassification/HighPriorityClassification.service');




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

generateBaseData = async () => {
    console.log('...::: GENERATING DB BASE DATA :::...');
    const configurationKeys = await ConfigurationModel.find();
    if(configurationKeys.length < 1) {
        console.log('CREATING CONFIGURATION KEYS');
        await ConfigurationModel.create({configKey: {isTrained: false}});
    }
    const category = await Category.findOne({category: 'CHATBOT'});
    if(category == null) {
        console.log('CREATING CHATBOT CATEGORY');
        await Category.create({category: 'CHATBOT', isActive: false});
    }
    const classificationCategory = await ClassificationCategory.findOne({category: 'OTHERS'});
    if(classificationCategory == null) {
        console.log('CREATING OTHERS CLASSIFICATION CATEGORY');
        await ClassificationCategory.create({category: 'OTHERS', keywords: 'others'});
    }
    const countHighPriorityClassification = await HighPriorityClassification.countDocuments();
    if(countHighPriorityClassification == 0 || countHighPriorityClassification == null) {
        console.log('CREATING STARTER DATA HighPriorityClassification');
        HighPriorityClassification.createObject({keyword: 'STARTER DATA: Create your own data and delete me'})
    }
}

(async function connect() {
    const connection = await mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.BD_URI}?retryWrites=true&w=majority`)
        .catch(err => console.log(`DB connection ERROR: ${err}`));
    AutoIncrementFactory(connection);
    generateBaseData();
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
