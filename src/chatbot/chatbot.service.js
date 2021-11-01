const HttpStatus = require('http-status-codes')
const Chatbot = require('./Chatbot.model')
const GenericService = require('../generics/GenericService')
const nlpService = require('../nlp/nlp.service')
const chatbotRepository = require('./chatbot.repository');
const utilFunctions = require('../utils/util.functions');
const chatbotFileService = require('./chatbotFile/chatbotFile.service');
const ChatbotFile = require('./chatbotFile/chatbotFile.model');

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
        const data = await this.createObject(chatbot);
        await classificationCategoryService.classifyOneAndUpdate(data);
        const response = await nlpService.evaluateData(req.body.question);
        if(response.answer) {
            res.status(HttpStatus.OK).json({answer: response.answer});
        } else {
            res.status(HttpStatus.NO_CONTENT).send();
        }
    }


    /**
     * Generates a csv with all the data from the db Schema
     * @returns Object {filename, csvFile, file path}
     */
    generateCsv = async () => {
        console.log('generateCsv ChatbotService');
        const date = new Date();
        const filename = `CHATBOT_DATA-${date.getMonth()}-${date.getFullYear()}`;
        const {stream, csv} = await chatbotRepository.generateCsv(`${filename}`);
        const path = stream.path;
        return {filename, csv, path};
    }

    /**
     * Get the csv with all the data from the db
     * the csv that has been created is later deleted
     * @param Request req 
     * @param Response res 
     */
    generateCurrentDataFile = async (req, res) => {
        console.log('generateCurrentDataFile ChatbotService');
        const {filename, csv, path} = await this.generateCsv();
        res.attachment(`${filename}.csv`).send(csv);
        await utilFunctions.deleteFileByStream(path);
    }

    /**
     * Generates a csv and creates a ChatbotFile object to store the csv
     * in the db
     */
    generateCsvAndSave = async () => {
        console.log('generateCsvAndSave ChatbotService');
        const {filename, csv, path} = await this.generateCsv();
        const chatbotFile = new ChatbotFile();
        chatbotFile.name = filename;
        chatbotFile.file = csv;
        await chatbotFileService.createObject(chatbotFile);
        await utilFunctions.deleteFileByStream(path); 
    }
}

module.exports = new ChatbotService();

const classificationCategoryService = require('./classificationCategory/classificationCategory.service');