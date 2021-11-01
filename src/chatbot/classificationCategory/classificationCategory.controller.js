const router = require('express').Router();
const { asyncWrapper, preAuthorize } = require('../../utils/util.functions');
const ClassificationCategory = require('./ClassificationCategory.model');
const ClassificationCategoryService = require('./classificationCategory.service');
const { cleanModel } = require('../../middlewares/util.middlewares');
const ROLE = require('../../role/Role.enum');


const cleanMiddleware = cleanModel(ClassificationCategory.schema.paths);

router.post('/classification-category',
    [preAuthorize(ROLE.COORDINATOR, ROLE.ASSISTANT), cleanMiddleware],
    asyncWrapper(ClassificationCategoryService.create));

router.get('/classification-category/all',
    [preAuthorize(ROLE.COORDINATOR, ROLE.ASSISTANT)],
    asyncWrapper(ClassificationCategoryService.getAll));

router.put('/classification-category/:id',
    [preAuthorize(ROLE.COORDINATOR, ROLE.ASSISTANT), cleanMiddleware],
    asyncWrapper(ClassificationCategoryService.update));

router.delete('/classification-category/:id',
    [preAuthorize(ROLE.COORDINATOR, ROLE.ASSISTANT)],
    asyncWrapper(ClassificationCategoryService.delete));

router.post('/classification-category/classify',
    [preAuthorize(ROLE.COORDINATOR, ROLE.ASSISTANT)],
    asyncWrapper(ClassificationCategoryService.classifyData));
module.exports = router;