const router = require('express').Router();
const { asyncWrapper, preAuthorize } = require('../utils/util.functions');
const TicketService = require('./ticket.service');
const { cleanModel } = require('../middlewares/util.middlewares');
const Ticket = require('./Ticket.model');
const ROLE = require('../role/Role.enum');

const cleanMiddleware = cleanModel(Ticket.schema.paths);


router.post('/ticket', [cleanMiddleware], asyncWrapper(TicketService.create));

router.get('/ticket/dashboard', [preAuthorize(ROLE.COORDINATOR, ROLE.ASSISTANT)],asyncWrapper(TicketService.dashboard));

router.get('/ticket/id/:id', asyncWrapper(TicketService.getById));


module.exports = router;