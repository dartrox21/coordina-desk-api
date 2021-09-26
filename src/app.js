require('dotenv').config({path: __dirname + '/configuration/.env'});
require('./configuration/mongodb.config');
const express = require('express');
const bodyparser = require('body-parser');
const routes = require('./routes');
const errorMiddleware = require('./middlewares/error.middleware');
const { validateToken } = require('./auth/auth.middleware');
const cors = require('cors');
require('./crons');



app = express();

app.use(bodyparser.urlencoded({extended : false}));

app.use(bodyparser.json());

app.use(cors())

app.use(validateToken);

app.use(routes);

app.use(errorMiddleware);

app.listen(process.env.PORT ,() => console.log(`Running EDP in PORT ${process.env.PORT}`));
