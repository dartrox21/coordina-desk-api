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

/**
 * At 1:01:01 am of 30 July&December this cron job should be executed
 */
const generateSemiAnnualCsv = cron.schedule('1 1 1 30 July,December *', async () => {
    console.log('....::::: CRON JOB GENERATE SEMI-ANNUAL CSV :::::.....');
    await chatbotService.generateCsvAndSave();
    console.log('....::::: ENDS CRON JOB GENERATE SEMI-ANNUAL CSV :::::.....');
}, {
    scheduled: false,
    timezone: process.env.TZ
});

generateSemiAnnualCsv.start();