const MailService = require('./mail.service');
const fs = require('fs').promises;
require('dotenv').config({path: __dirname + '/configuration/.env'});
const AuthService = require('../auth/auth.service');

class ActivationMailService {

    BODY = '';
    SUBJECT = 'Email de activacion'
    URL = `${process.env.PORTAL_URL}/activate` 

    constructor() {
        this.sendMail = this.sendMail.bind(this);
        this.getHtmlFile = this.getHtmlFile.bind(this);
        this.getHtmlFile();
    }

    async getHtmlFile() {
        this.BODY = await fs.readFile('./resources/activationEmail.html', 'utf8'); 
    }

    /**
     * Send an activation email
     * @param string recipent 
     */
    async sendMail(recipent, id) {
        console.log('inside');
        const token = await AuthService.createToken(id);
        console.log('token has been created');
        const body = this.BODY.replaceAll('ACTIVATION_URL', `${this.URL}/id/${id}/token/${token}`);
        await MailService.sendMail(this.SUBJECT, body, recipent);
    }
}

module.exports = new ActivationMailService();