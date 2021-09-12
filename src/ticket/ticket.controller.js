const router = require('express').Router();
const { asyncWrapper } = require('../utils/util.functions');
const TicketService = require('./ticket.service');
const { cleanModel } = require('../middlewares/util.middlewares');
const Ticket = require('./Ticket.model');
const cleanMiddleware = cleanModel(Ticket.schema.paths);



router.post('/ticket', [cleanMiddleware], asyncWrapper(TicketService.create));

router.get('/ticket/:id', asyncWrapper(TicketService.getById));


module.exports = router;