const CustomErrorMessages = require('./CustomErrorMessages');
const HttpStatus = require('http-status-codes');

class CustomValidateException {
    field = '';
    value = '';
    statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    message = CustomErrorMessages.UNDEFINED_ERROR;
    constructor() { }

    /**
     * Sets a custom status code
     * @param number status 
     */
    status(status) {
        this.statusCode = status;
        return this;
    }

    /**
     * Sets a custom error message
     * @param string customErrorMessage 
     */
    errorMessage(customErrorMessage) {
        this.message = customErrorMessage;
        return this;
    }

    /**
     * Sets the filed where the error was found
     * @param string field 
     */
    setField(field) {
        this.field = field;
        return this;
    }

    /**
     * Sets the value of the field where the error was found
     * @param string value 
     */
    setValue(value) {
        this.value = value;
        return this;
    }

    /**
     * Sets the status code to 409 conflict
     */
    conflict() {
        this.statusCode = HttpStatus.CONFLICT;
        return this;
    }

    /**
     * Sets the status code to 404 not found
     */
    notFound() {
        this.statusCode = HttpStatus.NOT_FOUND;
        return this;
    }

    /**
     * Sets the status code to 401 unauthorized
     * Semantically this response means "unauthenticated"
     */
    unauthorized() {
        this.statusCode = HttpStatus.UNAUTHORIZED;
        return this;
    }

    /**
     * Sets the status code to 403 forbidden
     */
    forbidden() {
        this.statusCode = HttpStatus.FORBIDDEN;
        return this;
    }

    /**
     * Builds and returns the Custom Error that should
     * be send to the error middleware
     */
    build() {
        const customError = new CustomError();
        customError.status = this.statusCode;
        customError.message = this.message;
        customError.field = this.field;
        customError.value = this.value;
        return customError;
    }
}

/**
 * Custom Error class that extends the Error object
 * New params are added such as field and value.
 * Deletes the stask trace
 */
class CustomError extends Error {
    field = '';
    value = '';
    constructor() {
        super(CustomErrorMessages.UNDEFINED_ERROR);
        this.status = HttpStatus.INTERNAL_SERVER_ERROR;
        delete this.stack;
    }
}

module.exports = new CustomValidateException();
