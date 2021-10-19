const CustomErrorMessages = require("../exceptionHandler/CustomErrorMessages");
const CustomValidateException = require("../exceptionHandler/CustomValidateException");
const GenericService = require("../generics/GenericService");
const Category = require('./Category.model');
const categoryRepository = require("./category.repository");


class CategoryService extends GenericService {

    CHATBOT = 'CHATBOT';

    constructor() {
        super(Category);
    }

    uniqueValidateException = async (category) => {
        console.log('CategoryService uniqueValidateException');
        const categoriesByName = await this.getAllObjects({category: category.category});
        if(categoriesByName.length > 0) {
            throw CustomValidateException.conflict()
                .errorMessage(CustomErrorMessages.MUST_BE_UNIQUE)
                .setField('category').setValue(category.category).build();
        }
    }

    validateChatbotCategory = (category) => {
        if(category.category === this.CHATBOT) {
            throw CustomValidateException.conflict()
                .errorMessage(CustomErrorMessages.OPERATION_NOT_ALLOWED)
                .setField(category.category).setValue(this.CHATBOT).build();
        }
    }

    /**
     * Deletes a category if it does not has faqs
     * @param Request req 
     * @param Response res 
     * @returns 200 OK if the category is deleted
     *          409 conflict if the category has inner faqs
     */
    delete = async (req, res) => {
        console.log('delete CategoryService');
        const id = req.params.id;
        let category = await this.findByIdAndValidate(id);
        this.validateChatbotCategory(category);
        const faqs = await faqService.getAllObjects({category: id});
        if(faqs.length > 0) {
            throw CustomValidateException.conflict()
                .setField('Has faqs. Faqs count').setValue(faqs.length)
                .errorMessage(CustomErrorMessages.DELETE_HAS_DEPENDENCIES).build();
        }
        await categoryRepository.delete(id);
        return res.status(HttpStatus.OK).send();
    }

    /**
     * Get the list of all categories sort by category name
     * @param req Request object
     * @param res Response object
     * @returns 200 OK if the list is not empty.
     * @returns 204 NO CONTENT if the list is empty.
     */
    getAll = async (req, res) => {
       console.log('getAll CategoryService');
       const categories = await categoryRepository.getAll(req.query.filters);
       categories.sort((a, b) => (a.category > b.category) ? 1 : -1);
       this.getListResponse(res, categories);
    }

    update = async (req, res) => {
        console.log('update generic');
        const id = req.params.id;
        let category = await this.findByIdAndValidate(id);
        this.validateChatbotCategory(category);
        await this.uniqueValidateException(req.body);
        if(id !== req.body._id) {
            throw CustomValidateException.conflict().errorMessage(CustomErrorMessages.ID_NOT_MATCH)
                .setField('id').setValue(`${id} !== ${req.body._id}`).build();
        }
        res.status(HttpStatus.OK).json(await this.updateObject(req.body));
    }
}

module.exports = new CategoryService();

// requiring elements at the very botton to avoid circular dependency
const faqService = require("./faq/faq.service");