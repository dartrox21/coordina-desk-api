const Category = require('./Category.model');
const GenericRepository = require('../generics/GenericRepository');

class CategoryRepository extends GenericRepository {

    constructor() {
        super(Category);
    }

    findByCategory = async (category) => {
        return await Category.findOne(category);
    }

}

module.exports = new CategoryRepository();