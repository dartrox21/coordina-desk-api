const GenericRepository = require("../../generics/GenericRepository");
const TicketContent = require('./TicketContet.model');

class TicketContentRepository extends GenericRepository {
    constructor() {
        super(TicketContent);
    }
}

module.exports = new TicketContentRepository();