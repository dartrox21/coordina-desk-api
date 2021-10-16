const GenericService = require("../../generics/GenericService");
const Faq = require('./Faq.model');
const categoryService = require("../category.service");
const HttpStatus = require('http-status-codes');
const { lastIndexOf } = require("underscore");
const CustomValidateException = require("../../exceptionHandler/CustomValidateException");
const CustomErrorMessages = require("../../exceptionHandler/CustomErrorMessages");
const orderProjection = require("./projections/order.projections");

class FaqService extends GenericService {
    constructor() {
        super(Faq);
    }

    uniqueValidateException = async (faq) => {}

    /**
     * Creates a faq
     * @param req Request object
     * @param res Response object
     */
    create = async (req, res) => {
       console.log('Create FaqService');
       const faq = req.body;
       const faqs = await this.getAllObjects({category: faq.category});
       faq.order = faqs.length > 0 ? faqs.length : 0;
       res.status(HttpStatus.CREATED).json(await this.genericRepository.save(faq));
    }

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

    /**
     * Asigns a faq to a ner position and 
     * reorders all the other faqs
     * @param Request req 
     * @param Response res 
     */
    reorder = async (req, res) => {
        console.log('reorder FaqService');
        const faq = await this.findByIdAndValidate(req.params.id, orderProjection);
        const faqs = await this.getAllObjects({category: faq.category});
        if(req.params.position > faqs.length - 1) {
            throw CustomValidateException.conflict()
                .setField('position').setValue(req.params.position).errorMessage(CustomErrorMessages.INVALID_POSITION).build();
        }

        faqs.sort((a, b) => (a.order > b.order) ? 1 : -1);
        faqs.splice(req.params.position, 0, faq);
        faqs.splice(faq.order+1, 1);
        faqs.forEach(async (faq, idx) => {
            faq.order = idx;
            await this.updateObject(faq);
        });
        res.status(HttpStatus.OK).send();
    }
}

module.exports = new FaqService();