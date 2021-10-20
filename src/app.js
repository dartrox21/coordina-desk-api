require('dotenv').config({path: __dirname + '/configuration/.env'});
require('./configuration/mongodb.config');
const express = require('express');
const bodyparser = require('body-parser');
const routes = require('./routes');
const errorMiddleware = require('./middlewares/error.middleware');
const { validateToken } = require('./auth/auth.middleware');
const cors = require('cors');
const CustomValidateException = require('./exceptionHandler/CustomValidateException');
const CustomErrorMessages = require('./exceptionHandler/CustomErrorMessages');

require('./crons');


corsOptions = {
    origin: function(origin, cb) {
        if(['https://coordinadesk.netlify.app/'].indexOf(origin) !== -1) {
            cb(null, true);
        } else {
            cb(CustomValidateException.errorMessage(CustomErrorMessages.ORIGIN_NOT_ALLOWED).build());
        }
    },
    methods: "GET,OPTIONS,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 200,
    allowedHeaders: 'Content-Type,Authorization'
}

app = express();

app.use(cors(corsOptions));

app.use(bodyparser.urlencoded({extended : false}));

app.use(bodyparser.json());

app.use(validateToken);

app.use(routes);

app.use(errorMiddleware);

app.listen(process.env.PORT ,() => console.log(`Running EDP in PORT ${process.env.PORT}`));
