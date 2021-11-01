const HttpStatus = require("http-status-codes");

const GenericService = require("../../generics/GenericService");
const ClassificationCategoryModel = require("./ClassificationCategory.model");
const chatbotService = require("../chatbot.service");


class ClassificationCategoryService extends GenericService {

    OTHERS = 'OTHERS';

    constructor() {
        super(ClassificationCategoryModel);
    }

    uniqueValidateException = async () => {
        // Implement if necesary
    }

    /**
     * 
     * @param Request req 
     * @param Response res 
     */
    classifyData = async (req, res) => {

        res.status(HttpStatus.OK).send();
    }

    classifyAll = async () => {
        const classificationCategories = await this.getAllObjects();
        const chatbotData = await chatbotService.getAllObjects();
    }
}

module.exports = new ClassificationCategoryService();