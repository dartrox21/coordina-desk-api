const Buffer = require('buffer').Buffer;
const GenericService = require('../../generics/GenericService')
const chatbotFile = require('./chatbotFile.model')
const utilFunctions = require('../../utils/util.functions');
const chatbotFileRepository = require('./chatbotFile.repository');
const chatbotFileProjection = require('./projections/chatbotFile.projection');


class ChatbotFileService extends GenericService  {

    constructor() {
        super(chatbotFile);
    }

    uniqueValidateException = async () => {
        // Implement if necesary
    }

    getAllFilesPageable = async (req, res) => {
        console.log('getAllFilesPageable ChatbotFileService');
        const limit = req.query.limit;
        const page = req.query.page;
        const filters = req.query.filters;
        const chatbotFiles = await this.getAllObjectsPageable(limit, page, filters, chatbotFileProjection);
        const totalDocuments = await chatbotFileRepository.countDocuments(filters);
        this.getPageableResponse(res, chatbotFiles, page, limit, totalDocuments);
    }

}


module.exports = new ChatbotFileService();