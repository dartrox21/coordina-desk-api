require('dotenv').config({path: __dirname + '/configuration/.env'});
require('./configuration/mongodb.config');
const express = require('express');
const bodyparser = require('body-parser');
const routes = require('./routes');
const errorMiddleware = require('./middlewares/error.middleware');
const { validateToken } = require('./auth/auth.middleware');
require('./crons');
const setUpCors = require('./configuration/cors');
const rateLimit = require('./configuration/rateLimit');

app = express();

app.use(bodyparser.urlencoded({extended : false}));

app.use(bodyparser.json());

setUpCors(app);

rateLimit(app);

app.use(validateToken);

app.use(routes);

app.use(errorMiddleware);

app.listen(process.env.PORT ,() => {
    console.log(`Running in NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`Running EDP in PORT: ${process.env.PORT}`);
    console.log(`Current timezone: ${process.env.TZ}`);
});