const CustomValidateException = require('../exceptionHandler/CustomValidateException');
const CustomErrorMessages = require('../exceptionHandler/CustomErrorMessages');
const jwt = require('jsonwebtoken');
const TokenService = require('./token/token.service');
const _ = require('underscore');



const WHITE_LIST = ['/auth/login', '/nlp/evaluate', '/ticket', '/ticket/*',
                    '/category/all'];

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
    console.log(`VALIDATING PATH: ${req._parsedUrl.pathname}`);
    if(isWhiteList(req._parsedUrl.pathname)) {
        console.log(`${req._parsedUrl.pathname} not executing validate token middleware`);
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

/**
 * If the path has a path variable it should be marked in the whitelist as *
 * EX:
 *   path in endpoint:  /user/:id
 *   path received:     /user/243
 *   path in whitelist:  /user/*
 * @param string path 
 * @returns boolean if the path is in the whitelist
 */
let isWhiteList = (path) => {
    const NORMAL_PATHS = WHITE_LIST.filter(e => !e.includes('*'));
    if(NORMAL_PATHS.includes(path)) {
      return true;
    }
    let STAR_ELEMENTS = WHITE_LIST.filter(e => e.includes('*'));
    const path_array = path.split('/').filter(d => d);
    return STAR_ELEMENTS.some(e => {
      let path_star_element = e.split('/').filter(d => d);
      const indexes = path_star_element.reduce((indexes, element, index) => {
        if(element === '*') {
          indexes.push(index);
        }
        return indexes;
      }, []);
      indexes.forEach(idx => path_star_element[idx] = path_array[idx]);
      return _.isEqual(path_array, path_star_element);
    });
};

module.exports = {
    validateAuthUser,
    validateToken
}
