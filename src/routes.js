const express = require('express');

const app = express();

app.use(require('./auth/auth.controller'));
app.use(require('./user/user.controller'));
app.use(require('./nlp/nlp.controller'));
app.use(require('./ticket/ticket.controller'));

module.exports = app;
