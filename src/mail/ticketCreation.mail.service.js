require('dotenv').config({path: __dirname + '/configuration/.env'});
const MailService = require('./mail.service');
const { getStatusTranslate } = require('../ticket/Status.enum');

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
        console.log(`Sending ticket creation mail to ticket ${ticket._id}`);
        let body = this.BODY.replace(/USERNAME/g, ticket.name);
        body = body.replace(/TICKET_ID/g, ticket._id);
        body = body.replace(/TITLE/g, ticket.title);
        body = body.replace(/DESCRIPTION/g, ticket.description);
        body = body.replace(/STATUS/g, getStatusTranslate(ticket.status));
        body = body.replace(/PORTAL_URL/g, this.URL);
        await MailService.sendMail(this.SUBJECT, body, ticket.email);
    }
}

module.exports = new TicketCreationService();