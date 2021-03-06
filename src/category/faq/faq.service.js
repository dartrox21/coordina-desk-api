const { moveArrayItemToNewIndex } = require("../../utils/util.functions");


module.exports = {};
const GenericService = require("../../generics/GenericService");
const Faq = require('./Faq.model');
const HttpStatus = require('http-status-codes');
const CustomValidateException = require("../../exceptionHandler/CustomValidateException");
const CustomErrorMessages = require("../../exceptionHandler/CustomErrorMessages");
const orderProjection = require("./projections/order.projections");
const faqRepository = require("./faq.repository");
const categoryService = require("../category.service");
const nlpService = require('../../nlp/nlp.service');
const faqProjection = require("./projections/faq.projection");

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
        let faq = req.body;
        if(faq.isActive) {
            const faqs = await this.getAllObjects({category: faq.category, isActive: true}, faqProjection);
            faq.order = faqs.length > 0 ? faqs.length : 0;
        } else {
            faq.order = null;
        }
        faq = await faqRepository.save(faq);
        this.updateNlpData();
        res.status(HttpStatus.CREATED).json(faq);
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
        const faqs = await this.getAllObjects(filters, faqProjection);
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
        let faqs = await this.getAllObjects({category: faq.category, isActive: true}, faqProjection);
        if(req.params.position > faqs.length - 1) {
            throw CustomValidateException.conflict()
                .setField('position').setValue(req.params.position).errorMessage(CustomErrorMessages.INVALID_POSITION).build();
        }
        faqs.sort((a, b) => (a.order > b.order) ? 1 : -1);
        faqs = moveArrayItemToNewIndex(faqs, faq.order, req.params.position);
        faqs.forEach(async (faq, idx) => {
            faq.order = idx;
            await this.updateObject(faq);
        });
        res.status(HttpStatus.OK).send();
    }

    delete = async (req, res) => {
        console.log('delete faqService');
        const id = req.params.id;
        const faq = await this.findByIdAndValidate(id);
        await faqRepository.delete(id);
        res.status(HttpStatus.OK).send();
        this.updateNlpData();
        
    }

    update = async (req, res) => {
        console.log('update faqService');
        const id = req.params.id;
        let newFaq = req.body;
        const previousFaq = await this.findByIdAndValidate(id);
        if(id !== newFaq._id) {
            throw CustomValidateException.conflict().errorMessage(CustomErrorMessages.ID_NOT_MATCH)
                .setField('id').setValue(`${id} !== ${newFaq._id}`).build();
        }
        if(newFaq.isActive) {
            const faqs = await this.getAllObjects({category: newFaq.category, isActive: true}, faqProjection);
            newFaq.order = faqs.length > 0 ? faqs.length: 0;
        } else {
            newFaq.order = null;
        }
        newFaq = await this.updateObject(newFaq);
        await this.reorderActiveFaqs(newFaq.category);
        res.status(HttpStatus.OK).json(newFaq);
        this.updateNlpData();
    }

    reorderActiveFaqs = async (category) => {
        const faqs = await this.getAllObjects({category: category, isActive: true}, faqProjection);
        faqs.sort((a, b) => (a.order > b.order) ? 1 : -1);
        faqs.forEach(async (faq, idx) => {
            faq.order = idx;
            await this.updateObject(faq);
        });
    }

    updateNlpData = async () => {
        await nlpService.updateData();
    }

    /**
     * Get the list of all objects
     * @param filters object of filters
     * @param projection projection object. Can be null
     * @returns List of objects found
     */
     getAllFaqs = async (filters = Object, projection = null) => {
        console.log('getAllFaqs faqService');
        return await faqRepository.getAll(filters, projection);
    }
}

module.exports = new FaqService();