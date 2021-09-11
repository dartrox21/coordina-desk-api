const MailConfiguration = require('../configuration/mail.configuration');
require('dotenv').config({path: __dirname + '/configuration/.env'});

class MailService {
    
    async sendMail(subject, body, ...recipents) {
        const mailOptions = {
            from: `${process.env.APP_EMAIL}`,
            to: `${recipents.join(',')}`,
            subject: subject,
            html: `${body}`
        };
        const transporter = await MailConfiguration.getTransporter();
        const info = await transporter.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId);
    }

}

module.exports = new MailService();