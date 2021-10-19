const Faq = require('./Faq.model');
const GenericRepository = require('../../generics/GenericRepository');

class FaqRepository extends GenericRepository {

    constructor() {
        super(Faq);
    }

}

module.exports = new FaqRepository();