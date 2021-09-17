const router = require('express').Router();
const CategoryService = require('./category.service');
const Category =  require('./Category.model');
const { asyncWrapper, preAuthorize } = require('../utils/util.functions');
const ROLE = require('../role/Role.enum');
const { cleanModel } = require('../middlewares/util.middlewares');

const cleanMiddleware = cleanModel(Category.schema.paths);

router.post('/category',
    [preAuthorize(ROLE.COORDINATOR, ROLE.ASSISTANT), cleanMiddleware],
    asyncWrapper(CategoryService.create));

router.get('/category/all', asyncWrapper(CategoryService.getAll));

module.exports = router;