const HttpStatus = require('http-status-codes')
const fs = require('fs');


const Chatbot = require('./Chatbot.model')
const GenericService = require('../generics/GenericService')
const nlpService = require('../nlp/nlp.service')
const chatbotRepository = require('./chatbot.repository');
const utilFunctions = require('../utils/util.functions');




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


    /**
     * Generate a csv file with all the data from the Schema
     * @param Request req 
     * @param Response res 
     */
    generateCurrentDataFile = async (req, res) => {
        const date = new Date();
        const filename = `CHATBOT_DATA-${date.getMonth()}-${date.getFullYear()}`;
        const {stream, csv} = await chatbotRepository.generateCsv(`${filename}`);
        res.attachment(`${filename}.csv`).send(csv);
        utilFunctions.deleteFileByStream(stream.path);
    }
}

module.exports = new ChatbotService();