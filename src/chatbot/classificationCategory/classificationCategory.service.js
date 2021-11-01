const GenericService = require("../../generics/GenericService");
const ClassificationCategoryModel = require("./ClassificationCategory.model");

class ClassificationCategoryService extends GenericService {
    constructor() {
        super(ClassificationCategoryModel);
    }

    uniqueValidateException = async () => {
        // Implement if necesary
    }
}

module.exports = new ClassificationCategoryService();