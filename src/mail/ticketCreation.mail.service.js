require('dotenv').config({path: __dirname + '/configuration/.env'});
const MailService = require('./mail.service');

class TicketCreationService {
    BODY = '';
    SUBJECT = 'Nuevo ticket coordina desk';
    URL = `${process.env.PORTAL_URL}`;

    constructor() {
        this.sendMail = this.sendMail.bind(this);
        this.getHtmlFile = this.getHtmlFile.bind(this);
        this.getHtmlFile();
    }

    async getHtmlFile() {
        this.BODY = await MailService.getHtmlFile('ticketCreationEmail');
    }

     async sendMail(ticket) {
        console.log(`Sending mail to ${ticket.email}`);
        let body = this.BODY.replaceAll('USERNAME', ticket.name);
        body = body.replaceAll('TICKET_ID', ticket._id);
        body = body.replaceAll('TITLE', ticket.title);
        body = body.replaceAll('DESCRIPTION', ticket.description);
        body = body.replaceAll('STATUS', ticket.status);
        body = body.replaceAll('PORTAL_URL', this.URL);
        await MailService.sendMail(this.SUBJECT, body, ticket.email);
    }
}

module.exports = new TicketCreationService();