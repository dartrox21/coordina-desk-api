const express = require('express');


const app = express();

app.use(require('./auth/auth.controller'));
app.use(require('./user/user.controller'));
app.use(require('./nlp/nlp.controller'));
app.use(require('./ticket/ticket.controller'));
app.use(require('./category/category.controller'));
app.use(require('./category/faq/faq.controller'));
app.use(require('./chatbot/chatbot.controller'));

module.exports = app;
