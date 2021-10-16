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

    // delete delete an element that does not has dependencies
}

module.exports = new CategoryService();