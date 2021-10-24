require('dotenv').config({path: __dirname + '/configuration/.env'});
const MailService = require('./mail.service');

class UpdateTicketService {
    BODY = '';
    SUBJECT = 'Hay novedades en tu ticket!';
    URL = `${process.env.PORTAL_URL}`;

    constructor() {
        this.sendMail = this.sendMail.bind(this);
        this.getHtmlFile = this.getHtmlFile.bind(this);
        this.getHtmlFile();
    }

    async getHtmlFile() {
        this.BODY = await MailService.getHtmlFile('updateTicketEmail');
    }

     async sendMail(ticket) {
        console.log(`Sending update ticket mail to ticket ${ticket._id}`);
        if(ticket.hasEmailUpdates) {
            let body = this.BODY.replace(/USERNAME/g, ticket.name);
            body = body.replace(/TICKET_ID/g, ticket._id);
            body = body.replace(/TITLE/g, ticket.title);
            body = body.replace(/TICKET_STATUS/g, ticket.status);
            body = body.replace(/PORTAL_URL/g, this.URL);
            await MailService.sendMail(this.SUBJECT, body, ticket.email);
        } else {
            console.log(`Not sending update ticket mail to ticket ${ticket._id} due to: Notifications are off`);
        }
    }
}

module.exports = new UpdateTicketService();