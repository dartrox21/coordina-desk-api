const csv = require('csv-parser');
const fs = require('fs');
const { NlpManager } = require('node-nlp');
const HttpStatus = require('http-status-codes');

class NlpService {

    nlp;

    constructor() {
        this.configure = this.configure.bind(this);
        this.train = this.train.bind(this);
        this.readInputData = this.readInputData.bind(this);
        this.evaluateQuestion = this.evaluateQuestion.bind(this);   
        this.evaluateData = this.evaluateData.bind(this);
        this.configure();
    }

    async configure() {
        this.nlp = new NlpManager({ languages: ['es'], nlu: { log: false } });
        this.nlp.settings.autoSave = false;
        this.nlp.addLanguage('es');
        await this.train();
        
    }

    async readInputData() {
        return new Promise((resolve)=>{
            return fs.createReadStream('./resources/inputData.csv')
            .pipe(csv())
            .on('data', (row) => {
                this.nlp.addDocument('es', row.INPUT, row.ID);
                this.nlp.addAnswer('es', row.ID, row.RESPONSE);
            })
            .on('end', () => {
                console.log('CSV file successfully processed');
                resolve();
            });
        });
    }

    async train() {
        console.log('Training NLP');
        await this.readInputData();
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
    async evaluateQuestion(req, res) {
        const response = this.evaluateData(req.body.question);
        // console.table(response.classifications);
        // console.log(`ANSWER: ${response.answer}`);
        // console.table(response.sentiment);
        if(response.answer) {
            res.status(HttpStatus.OK).json({answer: response.answer});
        } else {
            res.status(HttpStatus.NO_CONTENT).send();
        }
    }


    async evaluateData(data) {
        return await this.nlp.process('es', data);
    }

}

module.exports = new NlpService();