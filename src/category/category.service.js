const GenericService = require("../generics/GenericService");
const Category = require('./Category.model');


class CategoryService extends GenericService {
    constructor() {
        super(Category);
    }
}

module.exports = new CategoryService();