const HttpStatus = require("http-status-codes");
const { Classifier } = require('ml-classify-text');
const GenericService = require("../../generics/GenericService");
const ClassificationCategoryModel = require("./ClassificationCategory.model");
const chatbotService = require("../chatbot.service");
const CustomValidateException = require("../../exceptionHandler/CustomValidateException");
const CustomErrorMessages = require("../../exceptionHandler/CustomErrorMessages");




class ClassificationCategoryService extends GenericService {

    OTHERS = 'OTHERS';
    classifier;

    constructor() {
        super(ClassificationCategoryModel);
        this.setUpClassifierInstance();
    }

    uniqueValidateException = async () => {
        // Implement if necesary
    }


    setUpClassifierInstance = async () => {
        this.classifier = new Classifier();
        const classificationCategories = await this.getAllObjects();
        const categoriesWithoutOthers = classificationCategories.filter(c => c.category != this.OTHERS);
        categoriesWithoutOthers.forEach(c => this.classifier.train([c.keywords.toLowerCase()], `${c.category}`));
    }

    update = async (req, res) => {
        console.log('update ClassificationCategoryService');
        const id = req.params.id;
        const classificationCategory = await this.findByIdAndValidate(id);
        this.isOthersClassificationCategory(classificationCategory);
        if(id !== req.body._id) {
            throw CustomValidateException.conflict().errorMessage(CustomErrorMessages.ID_NOT_MATCH)
                .setField('id').setValue(`${id} !== ${req.body._id}`).build();
        }
        res.status(HttpStatus.OK).json(await this.updateObject(req.body));
    }

    /**
     * 
     * @param Request req 
     * @param Response res 
     */
    classifyData = async (req, res) => {
        res.status(HttpStatus.OK).json(await this.classifyAll());
    }

    /**
     * Classify all the chatbotdata into a classification category.
     */
    classifyAll = async () => {
        await this.setUpClassifierInstance();
        const classificationCategories = await this.getAllObjects();
        const chatbotData = await chatbotService.getAllObjects();
        classificationCategories.forEach(c => c.total = 0);
        chatbotData.forEach(data => {
            const predictions = this.classifier.predict(data.input.toLowerCase());
            if (predictions.length) {
                predictions.forEach(prediction => classificationCategories.find(c => c.category === prediction.label).total += 1);
            } else {
                classificationCategories.find(c => c.category === this.OTHERS).total += 1;
            }
        });
        await classificationCategories.forEach(async c => await this.updateObject(c));
        return {classificationCategories, totalElements: chatbotData.length};
    }


    isOthersClassificationCategory = async (classificationCategory) => {
        if(classificationCategory.category === this.OTHERS) {
            throw CustomValidateException.conflict()
                .errorMessage(CustomErrorMessages.OPERATION_NOT_ALLOWED)
                .setField(classificationCategory.category).setValue(this.OTHERS).build();
        }
    }

    delete = async (req, res) => {
        console.log('delete ClassificationCategoryService');
        const id = req.params.id;
        const classificationCategory = await this.findByIdAndValidate(id);
        this.isOthersClassificationCategory(classificationCategory);
        await this.genericRepository.delete(id);
        return res.status(HttpStatus.OK).send();
    }
}

module.exports = new ClassificationCategoryService();