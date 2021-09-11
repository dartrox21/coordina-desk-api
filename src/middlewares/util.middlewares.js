const { pick } = require('underscore');
const CustomValidateException = require('../exceptionHandler/CustomValidateException');
const { userHasAuthority } = require('../utils/util.functions');


/**
 * Middleware used to clean the req.body and leave it
 * only with the properties of the model.
 * It helps to prevent injecting data that does not corresponds to
 * the model.
 * The object cleaned will be send in the REQUEST BODY
 * you can acces to is as req.body
 * @param model Object to be cleaned
 */
function cleanModel(model) {
    return (req, res, next) => {
        console.log('Middleware: Clean Model');
        req.body = pick(req.body, Object.keys(model));
        next();
    }
}

/**
 * Middleware used to check if the user has at least one of the authorities
 * Previously the token should be validated using 'validateToken' middleware
 * @param roles Array string of roles
 * @param user REQUEST PARAM in the headers named as decodedUser
 */
function preAuthorize(roles) {
    return function (req, res, next) {
        console.log('Middleware: Pre Authorize');
        if (userHasAuthority(req.headers.decodedUser, roles)) {
            next();
        } else {
            next(CustomValidateException.forbidden().build());
        }
    }
}

/**
 * Sets all the filters in the req.query.
 * 
 *  - Limit  handles & set by default, if undefined,  the limit to 10 => req.query.limit
 *  - Page handles & set by default, if undefined,  the page to 0 => req.query.page
 *  - Q handles & set by default, if undefined, the q to undefined => req.query.q
 *    q param is already handled like a regex so it can be used in the desired field
 *  - Filters. Gets only the keys in the req.params that corresponds to the values in the projection.
 *    A object of filters is created and set in req.query.filter
 * 
 * Ex.
 * let users = await User.find(req.queryfilter)
 *      .select(userProjection)
 *      .limit(req.query.limit)
 *      .skip(req.query.page);
 * 
 * @param Projection projection array of properties
 */
function setFilters(projection) {
    return function (req, res, next) {
        console.log('Middleware: Set filters');
        const limit = req.query.limit !== undefined ? Number(req.query.limit) : 10;
        req.query.limit = limit;
        let page = req.query.page !== undefined ? Number(req.query.page) - 1 : 0;
        req.query.page = page === 0 ? page : limit * page;
        req.query.q = req.query.q !== undefined ? new RegExp(req.query.q) : undefined;
        let filter = {};
        const keys = Object.keys(req.query).filter(filter => projection.includes(filter));
        keys.forEach(f => {
            let filterName = f;
            let value = req.query[f];
            filter[filterName] = value;
        });
        req.query.filters = filter;
        next();
    }
}

module.exports = {
    cleanModel,
    preAuthorize,
    setFilters
}
