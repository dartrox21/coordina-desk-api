const router = require('express').Router();
const { asyncWrapper, preAuthorize } = require('../utils/util.functions');
const TicketService = require('./ticket.service');
const { cleanModel } = require('../middlewares/util.middlewares');
const Ticket = require('./Ticket.model');
const TicketContent = require('./ticketContent/TicketContet.model');
const ROLE = require('../role/Role.enum');

const cleanMiddleware = cleanModel(Ticket.schema.paths);
const cleanTicketContentMiddleware = cleanModel(TicketContent.schema.paths);


router.post('/ticket', 
    [cleanMiddleware],
    asyncWrapper(TicketService.create));

router.get('/ticket/dashboard',
    [preAuthorize(ROLE.COORDINATOR, ROLE.ASSISTANT)],
    asyncWrapper(TicketService.dashboard));

router.get('/ticket/id/:id', asyncWrapper(TicketService.getById));

router.post('/ticket/id/:id/student/answer',
    [cleanTicketContentMiddleware]
    ,asyncWrapper(TicketService.postStudentAnswer));

router.post('/ticket/id/:id/user/:userId/answer', 
    [cleanTicketContentMiddleware, preAuthorize(ROLE.COORDINATOR, ROLE.ASSISTANT)],
    asyncWrapper(TicketService.postUserAnswer));

router.patch('/ticket/id/:id/reasign-user/:userId',
    [preAuthorize(ROLE.COORDINATOR, ROLE.ASSISTANT)],
    asyncWrapper(TicketService.reasign));

router.patch('/ticket/id/:id/change-status',
    [preAuthorize(ROLE.COORDINATOR, ROLE.ASSISTANT)],
    asyncWrapper(TicketService.changeStatus));

router.patch('/ticket/deactivate/id/:id',
    [preAuthorize(ROLE.COORDINATOR, ROLE.ASSISTANT)],
    asyncWrapper(TicketService.deactivateTicket));

module.exports = router;