const Buffer = require('buffer').Buffer;
const GenericService = require('../../generics/GenericService')
const chatbotFile = require('./chatbotFile.model')
const chatbotFileRepository = require('./chatbotFile.repository');
const chatbotFileProjection = require('./projections/chatbotFile.projection');
const HttpStatus = require('http-status-codes');

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

    getById = async (req, res) => {
        console.log('getById ChatbotFileService');
        const file = await this.genericRepository.getById(req.params.id);
        let csvBuffer = Buffer.from(file.file, 'base64');
        if (!file) {
            res.status(HttpStatus.NOT_FOUND).send();
        } else {
            res.status(HttpStatus.OK).attachment(file.name).send(csvBuffer);
        }
    }
}


module.exports = new ChatbotFileService();