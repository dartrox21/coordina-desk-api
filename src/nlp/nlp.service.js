const { NlpManager } = require('node-nlp');

const fs = require('fs');
const HttpStatus = require('http-status-codes');

class NlpService {
    nlp;

    constructor() {
        setTimeout(() => {
            this.configure();
            
        }, 2000);
    }
    
    configure = async () => {
        this.nlp = new NlpManager({ languages: ['es'], nlu: { log: true } });
        this.nlp.settings.autoSave = false;
        this.nlp.addLanguage('es');
        await this.readInputData();
        await this.train();
    }

    /**
     * Read the input data file
     * @param String question except. Do not add the question to the nlp 
     */
    readInputData = async () => {
        const faqs = await faqService.getAllObjects();
        faqs.forEach(faq => {
            this.nlp.addDocument('es', faq.question, faq._id);
            this.nlp.addAnswer('es', faq._id, faq.answer);
        });
    }

    train = async () => { 
        console.log('Training NLP');
        await this.nlp.train();
        const data = this.nlp.export(false);
        await fs.writeFile('./resources/model.nlp', data, 'utf8', (err) => {
            if(err) {
              console.log(err);
            }
        });
        console.log('Training finalized');
    }

    /**
     * Evaluates the input data from the user and returns a response based in its question
     * @param RequestObj req 
     * @param ResponseObj res 
     * @returns 200 OK if a response has been found
     *          204 NO CONTENT if a response has not been found
     */
    evaluateQuestion = async (req, res) => {
        const response = await this.evaluateData(req.body.question);
        if(response.answer) {
            res.status(HttpStatus.OK).json({answer: response.answer});
        } else {
            res.status(HttpStatus.NO_CONTENT).send();
        }
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
        this.configure();
        
    }

}

module.exports = new NlpService();

// requiring elements at the very botton to avoid circular dependency
const faqService = require('../category/faq/faq.service');