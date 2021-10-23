const express = require('express');
const cors = require('cors');
const CustomErrorMessages = require('../exceptionHandler/CustomErrorMessages');
const CustomValidateException = require('../exceptionHandler/CustomValidateException');



const app = express();

// if (process.env.NODE_ENV === 'production') {
//     console.log('...::: SETTING CORS OPTIONS :::...');
//     let corsOptions = {
//         origin: function(origin, cb) {
//             if([process.env.PORTAL_URL].indexOf(origin) !== -1) {
//                 cb(null, true);
//             } else {
//                 console.log(`CORS ERROR INVALID ORIGIN ${origin}`);
//                 cb(CustomValidateException.errorMessage(CustomErrorMessages.ORIGIN_NOT_ALLOWED).build());
//             }
//         },
//         methods: "GET,OPTIONS,PUT,PATCH,POST,DELETE",
//         preflightContinue: false,
//         optionsSuccessStatus: 200,
//         allowedHeaders: 'Content-Type,Authorization'
//     }
//     app.use(cors(corsOptions));
// }

app.use(cors());


module.exports = app;