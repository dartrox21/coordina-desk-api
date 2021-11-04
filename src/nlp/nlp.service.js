const { NlpManager } = require('node-nlp');

const fs = require('fs');
const HttpStatus = require('http-status-codes');
const configuration = require('../configuration/configuration.model');
const categoryService = require('../category/category.service');



class NlpService {
    nlp;
    nlpFile = './resources/model.nlp';

    constructor() {
        setTimeout(() => {
            this.configure();
            
        }, 2000);
    }

    getIsTrainedKey = async () => {
        return configuration.findOne({$or: [
            {configKey: {isTrained: true}},
            {configKey: {isTrained: false}},
        ]});
    }

    updateIsTrainedKey = async (key, isTrained) => {
        console.log(`Updating IsTrained configuration key with value ${isTrained}`);
        key.configKey.isTrained = isTrained;
        await configuration.updateOne(key);
    }
    
    configure = async () => {
        this.nlp = new NlpManager({ languages: ['es'], nlu: { log: true } });
        this.nlp.settings.autoSave = false;
        this.nlp.addLanguage('es');
        let key = await this.getIsTrainedKey();
        if(key != null && !key.configKey.isTrained) {
            console.log('training');
            await this.readInputData();
            await this.train();
            await this.updateIsTrainedKey(key, true);
        } else {
            console.log('Model is already trained');
            const data = fs.readFileSync(this.nlpFile, 'utf8');
            await this.nlp.import(data);
        }
    }

    /**
     * Read the input data file
     * It wont train inactive faqs
     * faqs that are part of an inactive category
     * It will train faqs that are part of the chatbot catregory
     * @param String question except. Do not add the question to the nlp 
     */
    readInputData = async () => {
        const faqs = await faqService.getAllObjects({isActive: true});
        faqs.forEach(faq => {
            if(faq.category.isActive || categoryService.isChatbotCategory(faq.category)) {
                this.nlp.addDocument('es', faq.question, faq._id);
                this.nlp.addAnswer('es', faq._id, faq.answer);
            }
        });
    }

    train = async () => { 
        console.log('Training NLP');
        await this.nlp.train();
        const data = this.nlp.export(false);
        await fs.writeFile(this.nlpFile, data, 'utf8', (err) => {
            if(err) {
              console.log(err);
            }
        });
        console.log('Training finalized');
    }


    evaluateData = async (data) => {
        return await this.nlp.process('es', data);
    }

    /**
     * Write\update or delete data nlp manager.
     * 
     * note: The nlp manager must be instanciated again on update/delete because sometimes
     * it stores data in memory from the previous document and answer that was deleted or updated
     * @param FAQ data with the new question to be updated in the faqs
     */
    updateData = async () => {
        console.log('updateData NlpService');
        const isTrainedKey = await this.getIsTrainedKey();
        await this.updateIsTrainedKey(isTrainedKey, false);
        this.configure();
    }

    retrain = async (req, res) => {
        console.log('Retraining NlpService');
        await this.updateData();
        res.status(HttpStatus.OK).send();
    }
}

module.exports = new NlpService();

// requiring elements at the very botton to avoid circular dependency
const faqService = require('../category/faq/faq.service');const { any, isArguments } = require('underscore');

