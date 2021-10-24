const GenericService = require("../generics/GenericService");
const Ticket = require('./Ticket.model');
const HttpStatus = require('http-status-codes');
const ticketRepository = require('./ticket.repository');
const ticketCreation = require("../mail/ticketCreation.mail.service");
const STATUS = require('./Status.enum');
require('./ticketContent/TicketContet.model');
const ticketDashboardProjection = require('./projections/ticketDashboard.projections');
const ticketContentService = require('./ticketContent/ticketContent.service.js ');
const userService = require("../user/user.service");
const ROLE = require("../role/Role.enum");
const userProjection = require("../user/projections/user.projection");
const nlpService = require("../nlp/nlp.service");
const PRIORITY = require("./Priority.enum");
const updateTicketMailService = require("../mail/updateTicket.mail.service");



// Helper class
class DashBoard {
    todo = new Array();
    inProgress = new Array();
    done = new Array();
}

const HIGH_CLASSIFICATIONS = ['modular', 'egresado', 'egresar', 'fail', 'baja', 'permuta', 'acoso', 'indevido', 'molestar'];

class TicketService extends GenericService {

    constructor() {
        super(Ticket);
    }

    uniqueValidateException = async () => {
        // IMPLEMENT IF NECESARY
    }

    create = async (req, res) => {
        console.log('Creating a ticket TicketService');
        const ticket = await ticketRepository.save(req.body);
        await ticketCreation.sendMail(ticket);
        res.status(HttpStatus.CREATED).json(ticket);
        this.evaluate(ticket);
    }

    /**
     * Evaluates the ticket according its sentiment score and if anny of the high classifications 
     * is in the ticket title or description 
     * @param Ticket ticket 
     */
    evaluate = async (ticket) => {
        console.log(`Evaluating ticket: ${ticket._id}`);
        const titleEvaluation = await nlpService.evaluateData(ticket.title);
        let score = titleEvaluation.sentiment.score + 
            (HIGH_CLASSIFICATIONS.some(substring=>ticket.description.toLowerCase().includes(substring)) ? -0.5 : 0.15) +
            (HIGH_CLASSIFICATIONS.some(substring=>ticket.title.toLowerCase().includes(substring)) ? -0.5 : 0.2);
        let priority = PRIORITY.LOW;
        if(score < -0.3) {
            priority = PRIORITY.HIGH;
        } else if(score < 0.3) {
            priority = PRIORITY.MODERATE;
        }
        let role = ROLE.ASSISTANT;
        if(priority == PRIORITY.HIGH) {
            role = ROLE.COORDINATOR;
        }
        ticket.priority = priority;
        const user = await userService.findUserByRoleWithLessTickets(role, userProjection);
        await this.assignTicket(ticket, user, STATUS.ASIGNED);
        await updateTicketMailService.sendMail(ticket);
    }

    /**
     * the ticket schema ans user schema is updated with its corresponding
     * _ids references
     * @param ticket 
     * @param user 
     * @param status 
     */
    assignTicket = async (ticket, user, status) => {
        console.log(`Asigning ticket: ${ticket._id} to user ${user._id}`);
        user.tickets.push(ticket._id);
        await userService.updateUser(user, user._id);
        ticket.status = status;
        ticket.user = user._id;
        await ticketRepository.update(ticket._id, ticket);
    }

    /**
     * Returns all the tickets from the dashboard
     * 
     * // COLUMNS: TODO, IN_PROGRESS, DONE
     *    - TODO ref to          STATUS (WAITING_ASIGNATION, ASIGNED)
     *    - IN_PROGRESS ref to   STATUS (IN_PROGRESS)
     *    - DONE ref to          STATUS (RESOLVE, FINAL_RESOLVE)
     * @param RequestObj req 
     * @param ResponseObj res 
     */
    dashboard = async (req, res) => {
        console.log('get dashboard tickets TicketSerivce');
        const response = new DashBoard();
        req.query.filters.isActive = true;
        const tickets = await ticketRepository.getAll(req.query.filters, ticketDashboardProjection);
         tickets.forEach(ticket  => {
            ticket.user = userService.cleanUserObject(ticket.user, userProjection);
            switch(ticket.status) {
                case STATUS.WAITING_ASIGNATION:
                case STATUS.ASIGNED:
                    response.todo.push(ticket);
                    break;
                case STATUS.IN_PROGRESS:
                case STATUS.WAITING_RESPONSE:
                    response.inProgress.push(ticket);
                    break;
                case STATUS.RESOLVE:
                case STATUS.FINAL_RESOLVE:
                    response.done.push(ticket);
                    break;
            }
        });
        res.status(HttpStatus.OK).json(response);
    }

    /**
     * see doc method postAnswer
     * @param Request obj req 
     * @param Response obj res 
     * @returns Ticket with the data
     */
    postStudentAnswer = async (req, res) => {
        console.log('postStudentAnswer TicketService');
        req.body.isUser = false;
        await this.postAnswer(req, res, STATUS.IN_PROGRESS);
    }

    /**
     * see doc method postAnswer
     * @param Request obj req 
     * @param Response obj res 
     * @returns Ticket with the data
     */
    postUserAnswer = async (req, res) => {
        console.log('postUserAnswer TicketService');
        const user = await userService.findByIdAndValidate(req.params.userId);
        req.body.username = user.name;
        req.body.isUser = true;
        await this.postAnswer(req, res, STATUS.WAITING_RESPONSE);
        let ticket = await this.findByIdAndValidate(req.params.id);
        await updateTicketMailService.sendMail(ticket);
    }

    /**
     * Validates that the ticket exists.
     * Sets the status to in progress if it is different to resolve
     * @param Request obj req 
     * @param Response obj res 
     * @returns Ticket with the data
     */
    postAnswer = async (req, res, status) => {
        let ticket = await this.findByIdAndValidate(req.params.id);
        if(ticket.status !== STATUS.ASIGNED && ticket.status !== STATUS.WAITING_ASIGNATION) {
            ticket.status = status;
        }
        req.body.username = req.body.username == undefined ? ticket.name : req.body.username;
        const ticketContent = await ticketContentService.save(req.body);
        ticket.ticketContent.push(ticketContent);
        ticket = await ticketRepository.save(ticket);
        return res.status(HttpStatus.CREATED).json(ticket);
    }

    /**
     * 
     * @param Request obj req 
     * @param Res obj res 
     * @returns Ticket reasignated
     * @throws 404 NOT FOUND if the userId or ticket id is not found
     */
    reasign = async (req, res) => {
        console.log('reasign TicketService');
        let ticket = await this.findByIdAndValidate(req.params.id);
        await userService.removeTicket(ticket.user, ticket._id);
        const user = await userService.findByIdAndValidate(req.params.userId);
        user.tickets.push(ticket._id);
        await userService.updateUser(user, user._id);
        ticket.user = user;
        ticket = await ticketRepository.save(ticket);
        return res.status(HttpStatus.OK).json(ticket);
    }

    /**
     * 
     * @param Request obj req 
     * @param Response obj res 
     * @returns ticket reasigned
     * @throws  404 NOT FOUND if the ticket id is not found
     */
    changeStatus = async (req, res) => {
        console.log('changeStatus TicketService');
        let ticket = await this.findByIdAndValidate(req.params.id);
        ticket.status = req.body.status;
        ticket = await ticketRepository.save(ticket);
        res.status(HttpStatus.OK).json(ticket);
        await updateTicketMailService.sendMail(ticket);
    }

    /**
     * 
     * @param Req object req 
     * @param Res object res 
     * @returns 200 OK if the ticket has been deactivated
     * @returns 4040  NOT FOUND it the ticket id does no exist
     */
    deactivateTicket = async (req, res) => {
        console.log('deactivateTicket TicketService');
        let ticket = await this.findByIdAndValidate(req.params.id);
        await userService.removeTicket(ticket.user, ticket._id);
        ticket.isActive = false;
        ticket.status = STATUS.CLOSED_DUE_TO_INACTIVITY;
        await this.updateObject(ticket);
        res.status(HttpStatus.OK).send();
    }

    /**
     * Get all the unactive tickets
     * @returns 200 OK if the list is not empty.
     * @returns 204 NO CONTENT if the list is empty.
     */
    getAllInactiveTicketsPageable = async (req, res) => {
        console.log('getAllInactiveTicketsPageable TicketService');
        const limit = req.query.limit;
        const page = req.query.page;
        const filters = req.query.filters;
        filters.isActive = false;
        const tickets =  await this.getAllObjectsPageable(limit, page, filters, ticketDashboardProjection);
        tickets.forEach(ticket =>  {ticket.user = userService.cleanUserObject(ticket.user, userProjection);});
        const totalDocuments = await ticketRepository.countDocuments();
        this.getPageableResponse(res, tickets, page, limit, totalDocuments);
    }

    /**
     * 
     * @param Request obj req 
     * @param Response obj res 
     * @returns ticket reasigned
     * @throws  404 NOT FOUND if the ticket id is not found
     */
    changePriority = async (req, res) => {
        console.log('changePriority TicketService');
        let ticket = await this.findByIdAndValidate(req.params.id);
        ticket.priority = req.body.priority;
        ticket = await ticketRepository.save(ticket);
        res.status(HttpStatus.OK).json(ticket);
    }

    /**
     * change the boolean flag hasEmailUpdates
     * @param Request obj req 
     * @param Response obj res 
     * @returns 200 OK
     * @throws  404 NOT FOUND if the ticket id is not found
     */
    changeEmailNotifications = async (req, res) => {
        console.log('changeEmailNotifications TicketService');
        let ticket = await this.findByIdAndValidate(req.params.id);
        ticket.hasEmailUpdates = !ticket.hasEmailUpdates;
        await ticketRepository.save(ticket);
        res.status(HttpStatus.OK).send();
    }

}

module.exports = new TicketService();