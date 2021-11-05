const router = require('express').Router();
const { asyncWrapper, preAuthorize } = require('../utils/util.functions');
const TicketService = require('./ticket.service');
const { cleanModel, setFilters } = require('../middlewares/util.middlewares');
const Ticket = require('./Ticket.model');
const TicketContent = require('./ticketContent/TicketContet.model');
const ROLE = require('../role/Role.enum');
const HighPriorityClassification = require('./highPriorityClassification/HighPriorityClassification.service');


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

router.post('/ticket/high-priority-classification',
    [preAuthorize(ROLE.COORDINATOR)],
    asyncWrapper(HighPriorityClassification.create));

router.put('/ticket/high-priority-classification/:id',
    [preAuthorize(ROLE.COORDINATOR)],
    asyncWrapper(HighPriorityClassification.update));

router.get('/ticket/high-priority-classification',
    [preAuthorize(ROLE.COORDINATOR)],
    asyncWrapper(HighPriorityClassification.getAll));

router.delete('/ticket/high-priority-classification/:id',
    [preAuthorize(ROLE.COORDINATOR)],
    asyncWrapper(HighPriorityClassification.delete));

module.exports = router;