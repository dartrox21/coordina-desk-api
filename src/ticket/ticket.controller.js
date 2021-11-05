const router = require('express').Router();
const { asyncWrapper, preAuthorize } = require('../utils/util.functions');
const TicketService = require('./ticket.service');
const { cleanModel, setFilters } = require('../middlewares/util.middlewares');
const Ticket = require('./Ticket.model');
const TicketContent = require('./ticketContent/TicketContet.model');
const ROLE = require('../role/Role.enum');

const cleanMiddleware = cleanModel(Ticket.schema.paths);
const cleanTicketContentMiddleware = cleanModel(TicketContent.schema.paths);
const FILTERS = ['_id', 'status', 'priority', 'user', 'createdAt', 'updatedAt'];
const DEACTIVATED_FILTERS = ['_id', 'title', 'priority', 'status'];


router.post('/ticket', 
    [cleanMiddleware],
    asyncWrapper(TicketService.create));

router.get('/ticket/dashboard',
    [preAuthorize(ROLE.COORDINATOR, ROLE.ASSISTANT), setFilters(FILTERS)],
    asyncWrapper(TicketService.dashboard));

router.get('/ticket/id/:id',
    [preAuthorize(ROLE.COORDINATOR, ROLE.ASSISTANT)],
    asyncWrapper(TicketService.getById));

router.get('/ticket/id/:id/udgId/:udgId', asyncWrapper(TicketService.getByIdAndUdgId));

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

router.get('/ticket/inactive/all', 
    [preAuthorize(ROLE.COORDINATOR, ROLE.ASSISTANT), setFilters(DEACTIVATED_FILTERS)],
    asyncWrapper(TicketService.getAllInactiveTicketsPageable));

router.patch('/ticket/id/:id/change-priority',
    [preAuthorize(ROLE.COORDINATOR, ROLE.ASSISTANT)],
    asyncWrapper(TicketService.changePriority));

router.patch('/ticket/id/:id/email-updates', asyncWrapper(TicketService.changeEmailNotifications));


module.exports = router;