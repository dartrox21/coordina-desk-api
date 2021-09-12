const GenericService = require("../generics/GenericService");
const Ticket = require('./Ticket.model');
const HttpStatus = require('http-status-codes');
const ticketRepository = require('./ticket.repository');
const ticketCreation = require("../mail/ticketCreation.mail.service");

class TicketService extends GenericService {

    constructor() {
        super(Ticket);
        this.uniqueValidateException = this.uniqueValidateException.bind(this);
        this.create = this.create.bind(this);
    }

    async uniqueValidateException() {
        // IMPLEMENT IF NECESARY
    }

    async create(req, res) {
        console.log('Creating a ticket');
        const ticket = await ticketRepository.save(req.body);
        await ticketCreation.sendMail(ticket);
        res.status(HttpStatus.CREATED).json(ticket);
    }
}

module.exports = new TicketService();