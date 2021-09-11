const CustomValidateException = require('../exceptionHandler/CustomValidateException');
const CustomErrorMessages = require('../exceptionHandler/CustomErrorMessages');
const jwt = require('jsonwebtoken');
const TokenService = require('./token/token.service');

/**
 * Middleware to validate that the body contains a user and a password
 */
let validateAuthUser = (req, res, next) => {
    const user = req.body;
    console.log('Middleware: Validate auth user');
    if(!user.email || !user.password) {
        next(CustomValidateException.errorMessage(CustomErrorMessages.BAD_REQUEST).build());
    } else {
        req.body = user;
        next();
    }
}

/**
 * Middleware used to validate the token.
 * The decoded user will be set in the headers as 'decodedUser'.
 * The token will be set in the headers as 'token'.
 * @throws CustomValidateException unaithorized if the token expired
 */
let validateToken = (req, res, next) => {
    console.log('Middleware: validate token');
    if(req._parsedUrl.pathname === '/auth/login' || req._parsedUrl.pathname === '/user') {
        console.log('Auth/login not executing middleware');
        return next();
    }
    if (req.headers && req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, process.env.SECRET, (err, decoded) => { 
            if(err) {
                throw CustomValidateException.unauthorized().build();
            } else {
                TokenService.findOne(req, res, next).then(token => {
                  if(token == null) {
                    req.headers.decodedUser = decoded;
                    next();
                  } else {
                    next(CustomValidateException.unauthorized().build());
                  }
                }).catch(() => next(CustomValidateException.status(500).build()));
            }
        });
    } else {
        next(CustomValidateException.unauthorized().build());
    }
}

module.exports = {
    validateAuthUser,
    validateToken
}
