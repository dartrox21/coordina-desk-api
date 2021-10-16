const router = require('express').Router();
const CategoryService = require('./category.service');
const Category =  require('./Category.model');
const { asyncWrapper, preAuthorize } = require('../utils/util.functions');
const ROLE = require('../role/Role.enum');
const { cleanModel, setFilters } = require('../middlewares/util.middlewares');

const cleanMiddleware = cleanModel(Category.schema.paths);
const FILTERS = ['category', 'isActive'];

router.post('/category',
    [preAuthorize(ROLE.COORDINATOR, ROLE.ASSISTANT), cleanMiddleware],
    asyncWrapper(CategoryService.create));

router.get('/category/all',
    [setFilters(FILTERS)],
    asyncWrapper(CategoryService.getAll));

router.put('/category/:id',
    [preAuthorize(ROLE.COORDINATOR, ROLE.ASSISTANT), cleanMiddleware],
    asyncWrapper(CategoryService.update));

router.delete('/category/:id',
    [preAuthorize(ROLE.COORDINATOR, ROLE.ASSISTANT)],
    asyncWrapper(CategoryService.delete));

module.exports = router;