require('dotenv').config({path: __dirname + '/configuration/.env'});
require('./configuration/mongodb.config');
const express = require('express');
const bodyparser = require('body-parser');
const routes = require('./routes');
const errorMiddleware = require('./middlewares/error.middleware');
const { validateToken } = require('./auth/auth.middleware');
const cors = require('cors');
require('./crons');

var corsOptions = {
    origin: 'https://coordinadesk.netlify.app/',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
corsOptions = {
    origin: function(origin, cb) {
        if([].indexOf(origin) !== -1) {
            cb(null, true);
        } else {
            cb(new Error('Not allowed by cors'));
        }
    },
    methods: "DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 200
}

app = express();

app.use(cors(corsOptions));

app.use(bodyparser.urlencoded({extended : false}));

app.use(bodyparser.json());

app.use(validateToken);

app.use(routes);

app.use(errorMiddleware);

app.listen(process.env.PORT ,() => console.log(`Running EDP in PORT ${process.env.PORT}`));
