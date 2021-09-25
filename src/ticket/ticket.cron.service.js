var cron = require('node-cron');

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
 * At 1am if the tickets with status resolved that have not been updated
 * for more than 2 days will be set to isActive = false
 */
const closedTickets = cron.schedule('* * 1 * * *', () => {
  console.log('....::::: CRON JOB CLOSED TICKERS :::::.....');

}, {
    scheduled: false,
    timezone: "America/Mexico_City"
});

/**
 * At 2am if the tickets in the dashboard that have not been updated
 * for more than 5 days will be set to isActive = false
 */
const expiredTickets = cron.schedule('* * 2 * * *', () => {
    console.log('....::::: CRON JOB EXPIRED TICKERS :::::.....');
  
  }, {
      scheduled: false,
      timezone: "America/Mexico_City"
});


closedTickets.start();
expiredTickets.start();