var cron = require('node-cron');
const TokenService = require('./token.service');

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
 * At 1am removes the tokens that have been expired for more than
 * 5 days
 */
// const expiredTokens = cron.schedule('* 15 1 * * *', async () => {
const expiredTokens = cron.schedule('* 15 20 * * *', async () => {
    console.log('....::::: CRON JOB EXPIRED TOKENS :::::.....');
    await TokenService.removeAllExpired();
    console.log('....::::: ENDS CRON JOB EXPIRED TOKENS :::::.....');
}, {
    scheduled: false,
    timezone: "America/Mexico_City"
});


expiredTokens.start();