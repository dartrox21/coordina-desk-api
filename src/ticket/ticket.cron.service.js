var cron = require('node-cron');
const ticketService = require('./ticket.service');
const STATUS = require('./Status.enum'); 
const ticketDashboardProjection = require('./projections/ticketDashboard.projections');
const updateTicketMailService = require('../mail/updateTicket.mail.service');
const userService = require('../user/user.service');


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
// const closedTickets = cron.schedule('* 10 1 * * *', async () => {
const closedTickets = cron.schedule('* 55 18 * * *', async () => {
    console.log('....::::: CRON JOB CLOSED TICKETS :::::.....');
    let nDaysAgo = new Date();
    nDaysAgo.setDate(nDaysAgo.getDate() - 2);
    const tickets = await ticketService.getAllObjects({isActive:true, updatedAt: {$lte: nDaysAgo}});
    await ticketService.updateMany({updatedAt: {$lte: nDaysAgo}, $or:[{status: STATUS.RESOLVE}, {status: STATUS.FINAL_RESOLVE}]}, 
        {isActive: false, status: STATUS.CLOSED_DUE_TO_INACTIVITY});
    await tickets.forEach(async ticket =>  {
        await userService.removeTicket(ticket.user, ticket._id);
    });
    console.log('....::::: ENDS CRON JOB CLOSED TICKETS :::::.....');
}, {
    scheduled: false,
    timezone: "America/Mexico_City"
});

/**
 * At 2am if the tickets in the dashboard that have not been updated
 * for more than 5 days will be set to isActive = false
 */
// const expiredTickets = cron.schedule('* 20 1 * * *', async () => {
const expiredTickets = cron.schedule('* * 19 * * *', async () => {
    console.log('....::::: CRON JOB EXPIRED TICKETS :::::.....');
    let nDaysAgo = new Date();
    nDaysAgo.setDate(nDaysAgo.getDate() - 5);
    const tickets = await ticketService.getAllObjects({isActive:true, updatedAt: {$lte: nDaysAgo}});
    await ticketService.updateMany({updatedAt: {$lte: nDaysAgo}}, {isActive: false, status: STATUS.CLOSED_DUE_TO_INACTIVITY});
    await tickets.forEach(async ticket =>  {
        ticket.status = STATUS.CLOSED_DUE_TO_INACTIVITY;
        await updateTicketMailService.sendMail(ticket);
        await userService.removeTicket(ticket.user, ticket._id);
    });
    console.log('....::::: ENDS CRON JOB EXPIRED TICKETS :::::.....');
  }, {
      scheduled: false,
      timezone: "America/Mexico_City"
});


closedTickets.start();
expiredTickets.start();