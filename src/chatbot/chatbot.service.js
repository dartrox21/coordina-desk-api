const HttpStatus = require('http-status-codes')

const Chatbot = require('./Chatbot.model')
const GenericService = require('../generics/GenericService')
const nlpService = require('../nlp/nlp.service')

class ChatbotService extends GenericService  {
    constructor() {
        super(Chatbot);
    }

    uniqueValidateException = async () => {
        // Implement if necesary
    }

    /**
     * Evaluates the input data from the user and returns a response based in its question
     * @param RequestObj req 
     * @param ResponseObj res 
     * @returns 200 OK if a response has been found
     *          204 NO CONTENT if a response has not been found
     */
    evaluateQuestion = async (req, res) => {
        const chatbot = new Chatbot();
        chatbot.input = req.body.question;
        await this.createObject(chatbot);
        const response = await nlpService.evaluateData(req.body.question);
        if(response.answer) {
            res.status(HttpStatus.OK).json({answer: response.answer});
        } else {
            res.status(HttpStatus.NO_CONTENT).send();
        }
    }


    generateCurrentDataFile = async (req, res) => {
        res.status(HttpStatus.OK).send();
    }
}

module.exports = new ChatbotService();