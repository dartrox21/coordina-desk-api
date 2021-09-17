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


// Helper class
class DashBoard {
    todo = new Array();
    inProgress = new Array();
    done = new Array();
}

class TicketService extends GenericService {

    constructor() {
        super(Ticket);
        this.uniqueValidateException = this.uniqueValidateException.bind(this);
        this.create = this.create.bind(this);
        this.evaluate = this.evaluate.bind(this);
        this.assignTicket = this.assignTicket.bind(this);
        this.postStudentAnswer = this.postStudentAnswer.bind(this);
        this.postUserAnswer = this.postUserAnswer.bind(this);
        this.reasign = this.reasign.bind(this);
    }

    async uniqueValidateException() {
        // IMPLEMENT IF NECESARY
    }

    async create(req, res) {
        console.log('Creating a ticket TicketService');
        const ticket = await ticketRepository.save(req.body);
        await ticketCreation.sendMail(ticket);
        res.status(HttpStatus.CREATED).json(ticket);
        this.evaluate(ticket);
    }

    /**
     * 
     * @param Ticket ticket 
     */
    async evaluate(ticket) {
        console.log(`Evaluating ticket: ${ticket._id}`);
        // classificate get priority and user to be asigned
        await this.assignTicket(ticket, "", STATUS.ASIGNED);
        // send email status update
    }

    async assignTicket(ticket, user, status) {
        console.log(`Asigning ticket: ${ticket._id} to user ${user._id}`);
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
    async dashboard(req, res) {
        console.log('get dashboard tickets TicketSerivce');
        const response = new DashBoard();
        const tickets = await ticketRepository.getAll({}, ticketDashboardProjection);
        tickets.forEach(ticket => {
            switch(ticket.status) {
                case STATUS.WAITING_ASIGNATION:
                case STATUS.ASIGNED:
                    response.todo.push(ticket);
                    break;
                case STATUS.IN_PROGRESS:
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
    async postStudentAnswer(req, res) {
        console.log('postStudentAnswer TicketService');
        await this.postAnswer(req, res);

    }

    /**
     * see doc method postAnswer
     * @param Request obj req 
     * @param Response obj res 
     * @returns Ticket with the data
     */
    async postUserAnswer(req, res) {
        console.log('postUserAnswer TicketService');
        const user = await userService.findByIdAndValidate(req.params.userId);
        req.body.username = user.name;
        await this.postAnswer(req, res);
    }

    /**
     * Validates that the ticket exists.
     * Sets the status to in progress if it is different to resolve
     * @param Request obj req 
     * @param Response obj res 
     * @returns Ticket with the data
     */
    async postAnswer(req, res) {
        let ticket = await ticketRepository.findByIdAndValidate(req.params.id);
        if (ticket.status !== STATUS.RESOLVE) {
            ticket.status = STATUS.IN_PROGRESS;
        }
        req.body.name = req.body.name == undefined ? ticket.name : req.body.name;
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
    async reasign(req, res) {
        console.log('reasign TicketService');
        let ticket = await this.findByIdAndValidate(req.params.id);
        const user = await userService.findByIdAndValidate(req.params.userId);
        if (ticket.user != null && ticket.user._id != user._id) {
            ticket.user = user;
            return res.status(HttpStatus.OK).json(ticket);
        }
        ticket.user = user;
        ticket = await ticketRepository.save(ticket);
        return res.status(HttpStatus.OK).json(ticket);
    }

}

module.exports = new TicketService();