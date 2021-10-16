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
    save = async(ticketContent) => {
        return await ticketRepository.save(ticketContent);
    }
}

module.exports = new TicketContentService();