var cron = require('node-cron');
const ticketService = require('./ticket.service');
const STATUS = require('./Status.enum'); 
const ticketDashboardProjection = require('./projections/ticketDashboard.projections');
const updateTicketMailService = require('../mail/updateTicket.mail.service');


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
const closedTickets = cron.schedule('* * 1 * * *', async () => {
    console.log('....::::: CRON JOB CLOSED TICKERS :::::.....');
    let nDaysAgo = new Date();
    nDaysAgo.setDate(nDaysAgo.getDate() - 2);
    await ticketService.updateMany({updatedAt: {$lte: nDaysAgo}, $or:[{status: STATUS.RESOLVE}, {status: STATUS.FINAL_RESOLVE}]}, 
        {isActive: false});

}, {
    scheduled: false,
    timezone: "America/Mexico_City"
});

/**
 * At 2am if the tickets in the dashboard that have not been updated
 * for more than 5 days will be set to isActive = false
 */
//  const expiredTickets = cron.schedule('*/5 * * * * *', async () => {
const expiredTickets = cron.schedule('* * 2 * * *', async () => {
    console.log('....::::: CRON JOB EXPIRED TICKERS :::::.....');
    let nDaysAgo = new Date();
    nDaysAgo.setDate(nDaysAgo.getDate() - 5);
    let tickets = await ticketService.getAllObjects({isActive:true, updatedAt: {$lte: nDaysAgo}});
    await ticketService.updateMany({updatedAt: {$lte: nDaysAgo}}, {isActive: false, status: STATUS.CLOSED_DUE_TO_INACTIVITY});
    await tickets.forEach(async ticket =>  {
        ticket.status = STATUS.CLOSED_DUE_TO_INACTIVITY;
        await updateTicketMailService.sendMail(ticket);
    });
  }, {
      scheduled: false,
      timezone: "America/Mexico_City"
});


closedTickets.start();
expiredTickets.start();