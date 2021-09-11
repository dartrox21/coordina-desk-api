const nodemailer = require('nodemailer');
require('dotenv').config({path: __dirname + '/configuration/.env'});

class MailConfigurations {

    transporter;

    constructor() {
        this.createTransporter = this.createTransporter.bind(this);
        this.getTransporter = this.getTransporter.bind(this);
        this.createTransporter();
    }

    // https://myaccount.google.com/lesssecureapps with the gmail account that will be sending the emails
    createTransporter() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: `${process.env.APP_EMAIL}`,
                pass: `${process.env.APP_EMAIL_PASS}`
            }
        });
    }

    /**
     * @returns SMTP Transport
     */
    getTransporter() {
        return this.transporter;

    }

}

module.exports = new MailConfigurations();