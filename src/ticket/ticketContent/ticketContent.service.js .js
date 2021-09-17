const GenericService = require('../../generics/GenericService');
const TicketContent =  require('./TicketContet.model');
const ticketRepository =  require('./ticketContent.repository');

class TicketContentService extends GenericService { 
    constructor() {
        super(TicketContent);
    }

    /**
     * Creates a new ticket content
     * @param TicketContent ticketContent 
     * @returns TicketContent created
     */
    async save(ticketContent) {
        return await ticketRepository.save(ticketContent);
    }
}

module.exports = new TicketContentService();