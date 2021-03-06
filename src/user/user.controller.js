const router = require('express').Router();
const UserService = require('./user.service');
const User = require('./User.model');
const { cleanModel, setFilters } = require('../middlewares/util.middlewares');
const { asyncWrapper, preAuthorize } = require('../utils/util.functions');
const ROLE = require('../role/Role.enum');

const cleanMiddleware = cleanModel(User.schema.paths);
const FILTERS = ['_id', 'email', 'name', 'isActive', 'role'];

router.post('/user',
    [preAuthorize(ROLE.COORDINATOR), cleanMiddleware],
    asyncWrapper(UserService.create));

router.put('/user/resend-email',
    [ cleanMiddleware],
    asyncWrapper(UserService.resendActivationEmail));

router.put('/user/activate',
    [cleanMiddleware],
    asyncWrapper(UserService.activate));

router.get('/user/all', 
    [preAuthorize(ROLE.COORDINATOR, ROLE.ASSISTANT), setFilters(FILTERS)],
    asyncWrapper(UserService.getAll));
    
router.get('/user/all/pageable', 
    [preAuthorize(ROLE.COORDINATOR), setFilters(FILTERS)],
    asyncWrapper(UserService.getAllPageable));

router.get('/user/:id',
    asyncWrapper(UserService.getById));

router.delete('/user/:id',
    [preAuthorize(ROLE.COORDINATOR)],
    asyncWrapper(UserService.deactivate));

router.delete('/user/:id/delete',
    [preAuthorize(ROLE.COORDINATOR),
    asyncWrapper(UserService.delete)]);

router.put('/user/:id',
    [preAuthorize(ROLE.COORDINATOR), cleanMiddleware],
    asyncWrapper(UserService.update));

module.exports = router;
