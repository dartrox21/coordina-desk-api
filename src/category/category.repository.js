const Category = require('./Category.model');
const GenericRepository = require('../generics/GenericRepository');

class CategoryRepository extends GenericRepository {

    constructor() {
        super(Category);
    }

}

module.exports = new CategoryRepository();