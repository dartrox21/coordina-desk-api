const fs = require('fs')

const GenericRepository = require('../generics/GenericRepository')
const Chatbot = require('./Chatbot.model')
const utilFunctions = require('../utils/util.functions')


class ChatbotRepository extends GenericRepository  {
    constructor() {
        super(Chatbot);
    }

    /**
     * Generas a csv file with all the data from the chatbot Schema
     * @param String filename 
     */
    generateCsv = async (filename) => {
        const stream = await Chatbot.findAndStreamCsv()
            .pipe(fs.createWriteStream(`${__basedir}/resources/${filename}.csv`));
        let csv = await utilFunctions.readFile(stream.path);
        return {stream, csv};
    }
}

module.exports = new ChatbotRepository();