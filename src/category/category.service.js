const CustomErrorMessages = require("../exceptionHandler/CustomErrorMessages");
const CustomValidateException = require("../exceptionHandler/CustomValidateException");
const GenericService = require("../generics/GenericService");
const Category = require('./Category.model');



class CategoryService extends GenericService {
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
        await this.findByIdAndValidate(id);
        const faqs = await faqService.getAllObjects({category: id});
        if(faqs.length > 0) {
            throw CustomValidateException.conflict()
                .setField('Has faqs. Faqs count').setValue(faqs.length)
                .errorMessage(CustomErrorMessages.DELETE_HAS_DEPENDENCIES).build();
        }
        await this.genericRepository.delete(id);
        return res.status(HttpStatus.OK).send();
    }
}

module.exports = new CategoryService();

// requiring elements at the very botton to avoid circular dependency
const faqService = require("./faq/faq.service");