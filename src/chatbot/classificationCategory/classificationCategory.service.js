const HttpStatus = require("http-status-codes");
const { Classifier } = require('ml-classify-text');
const GenericService = require("../../generics/GenericService");
const ClassificationCategoryModel = require("./ClassificationCategory.model");
const chatbotService = require("../chatbot.service");
const CustomValidateException = require("../../exceptionHandler/CustomValidateException");
const CustomErrorMessages = require("../../exceptionHandler/CustomErrorMessages");




class ClassificationCategoryService extends GenericService {

    OTHERS = 'OTHERS';
    classifier; // instance of Classifier
    classificationCategories; // Array of ClassificationCategory

    constructor() {
        super(ClassificationCategoryModel);
        this.setUpClassifierInstance();
    }

    uniqueValidateException = async () => {
        // Implement if necesary
    }


    /**
     * https://www.npmjs.com/package/ml-classify-text
     * Using n-grams
     * The default behavior is to split up texts by single words (known as a bag of words, or unigrams).
     * This has a few limitations, since by ignoring the order of words, it's impossible to correctly match phrases and expressions.
     * In comes n-grams, which, when set to use more than one word per term, act like a sliding window that moves across the text — a continuous sequence of words of the specified amount, which can greatly improve the accuracy of predictions.
     */
    setUpClassifierInstance = async () => {
        console.log('setUpClassifierInstance ClassificationCategoryService');
        this.classifier = new Classifier({
            nGramMin: 1,
            nGramMax: 3
        });
        this.classificationCategories = await this.getAllObjects();
        const categoriesWithoutOthers = this.classificationCategories.filter(c => c.category != this.OTHERS);
        categoriesWithoutOthers.forEach(c => this.classifier.train([c.keywords.toLowerCase()], `${c.category}`));
    }

    create = async (req, res) => {
        console.log('Create ClassificationCategoryService');
        const object = req.body;
        await this.uniqueValidateException(object);
        res.status(HttpStatus.CREATED).json(await this.genericRepository.save(object));
        await this.classifyAll();
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
        await this.classifyAll();
    }

    /**
     * 
     * @param Request req 
     * @param Response res 
     */
    classifyData = async (req, res) => {
        console.log('classifyData ClassificationCategoryService');
        res.status(HttpStatus.OK).json(await this.classifyAll());
    }

    /**
     * Classify all the chatbotdata into a classification category.
     */
    classifyAll = async () => {
        console.log('classifyAll ClassificationCategoryService');
        await this.setUpClassifierInstance();
        this.classificationCategories = await this.getAllObjects();
        const chatbotData = await chatbotService.getAllObjects();
        this.classificationCategories.forEach(c => c.total = 0);
        chatbotData.forEach(data => this.classifyOne(data));
        await this.classificationCategories.forEach(async c => await this.updateObject(c));
        return {classificationCategories: this.classificationCategories, totalElements: chatbotData.length};
    }

    isOthersClassificationCategory = async (classificationCategory) => {
        console.log('isOthersClassificationCategory ClassificationCategoryService'); 
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
        res.status(HttpStatus.OK).send();
        await this.classifyAll();
    }

    /**
     * classify a chatbot into one or more categories and updates the 
     * classificationCategory
     * @param data chatbot data
     */
    classifyOneAndUpdate = async (data) => {
        console.log('classifyOneAndUpdate ClassificationCategoryService');
        const classificationsToBeUpdated = await this.classifyOne(data);
        console.log(classificationsToBeUpdated);
        await classificationsToBeUpdated.forEach(async c => await this.updateObject(c));
    }

    /**
     * Classify a chatbot data into one or more categories
     * @param data ChatbotData
     * @returns 
     */
    classifyOne = async (data) => {
        const predictions = new Set();
        let prediction = this.classifier.predict(data.input.toLowerCase());
        if(prediction.length > 0){
            predictions.add(prediction[0].label);
        }
        const tokens = this.classifier.tokenize(data.input.toLowerCase());
        for(let token in tokens) {
            prediction = this.classifier.predict(token);
            if(prediction.length > 0){
                predictions.add(prediction[0].label);
            }
        }
        const classificationsToBeUpdated = new Map();
        if (predictions.size > 0) {
            predictions.forEach(prediction => {
                const classificationCategory = this.findClassificationByCategory(prediction);
                classificationCategory.total += 1;
                classificationsToBeUpdated.set(classificationCategory._id, classificationCategory);
            });
        } else {
            const classificationCategory = this.findClassificationByCategory(this.OTHERS);
            classificationCategory.total += 1;
            classificationsToBeUpdated.set(classificationCategory._id, classificationCategory);
        }
        return [...classificationsToBeUpdated.values()];

    }

    findClassificationByCategory = (category) => {
        return this.classificationCategories.find(c => c.category === category);
    }
}

module.exports = new ClassificationCategoryService();