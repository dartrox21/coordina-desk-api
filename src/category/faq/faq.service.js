const GenericService = require("../../generics/GenericService");
const Faq = require('./Faq.model');
const categoryService = require("../category.service");

class FaqService extends GenericService {
    constructor() {
        super(Faq);
    }

    uniqueValidateException = async (faq) => {}

    /**
     * Get all the FAQs by category id.
     * Optional param isActive
     * @param Request req 
     * @param Response res 
     */
    getAllByCategory = async (req, res) => {
        console.log('FaqService getAllByCategory');
        const id = req.params.id;
        await categoryService.findByIdAndValidate(id);
        const filters = req.query.filters;
        filters.category = id;
        const faqs = await this.getAllObjects(filters);
        this.getListResponse(res, faqs);
    }
}

module.exports = new FaqService();