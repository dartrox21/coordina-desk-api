const cron = require('node-cron');
const chatbotService = require('./chatbot.service');


// # ┌────────────── second (optional)
// # │ ┌──────────── minute
// # │ │ ┌────────── hour
// # │ │ │ ┌──────── day of month
// # │ │ │ │ ┌────── month
// # │ │ │ │ │ ┌──── day of week
// # │ │ │ │ │ │
// # │ │ │ │ │ │
// # * * * * * *

const generateSemiAnnualCsv = cron.schedule('1 29 14 * * *', async () => {
    console.log('....::::: CRON JOB GENERATE SEMI-ANNUAL CSV :::::.....');

    await chatbotService.generateCsvAndSave();


    console.log('....::::: ENDS CRON JOB GENERATE SEMI-ANNUAL CSV :::::.....');
}, {
    scheduled: false,
    timezone: process.env.TZ
});

generateSemiAnnualCsv.start();