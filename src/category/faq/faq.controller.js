const router = require('express').Router();
const { asyncWrapper, preAuthorize } = require('../../utils/util.functions');
const ROLE = require('../../role/Role.enum');
const Faq = require('./Faq.model');
const FaqService = require('./faq.service');
const { cleanModel, setFilters } = require('../../middlewares/util.middlewares');
const cleanMiddleware = cleanModel(Faq.schema.paths);

const FILTERS = ['isActive'];

router.post('/faq',
    [preAuthorize(ROLE.COORDINATOR, ROLE.ASSISTANT), cleanMiddleware],
    asyncWrapper(FaqService.create));

router.get('/faq/category/:id',
    [setFilters(FILTERS)],
    asyncWrapper(FaqService.getAllByCategory));

router.delete('/faq/:id',
    [preAuthorize(ROLE.COORDINATOR, ROLE.ASSISTANT)],
    asyncWrapper(FaqService.delete));

router.put('/faq/:id',
    [preAuthorize(ROLE.COORDINATOR, ROLE.ASSISTANT), cleanMiddleware],
    asyncWrapper(FaqService.update));

router.patch('/faq/:id/reorder/:position',
    preAuthorize(ROLE.COORDINATOR, ROLE.ASSISTANT),
    asyncWrapper(FaqService.reorder));

module.exports = router;