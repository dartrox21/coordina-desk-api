const CustomErrorMessages = require('../exceptionHandler/CustomErrorMessages');
const HttpStatus = require('http-status-codes');

module.exports = function errorMiddleware(error, req, res, next) {
    console.log('Middleware: Error');
    const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || CustomErrorMessages.UNDEFINED_ERROR;
    const field = error.field || '';
    const value = error.value || '';
    const date = new Date();
    res.status(status)
    .send({
        status,
        message,
        field,
        value,
        date
    });
}
