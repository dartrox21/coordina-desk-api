const Ticket = require('./Ticket.model');
const GenericRepository = require('../generics/GenericRepository');

class TicketRepository extends GenericRepository {
    
    constructor() {
        super(Ticket);
    }

}

module.exports = new TicketRepository();