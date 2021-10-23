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
const expiredTokens = cron.schedule('1 5 1 * * *', async () => {
    console.log('....::::: CRON JOB EXPIRED TOKENS :::::.....');
    await TokenService.removeAllExpired();
    console.log('....::::: ENDS CRON JOB EXPIRED TOKENS :::::.....');
}, {
    scheduled: false,
    timezone: process.env.TZ
});


expiredTokens.start();