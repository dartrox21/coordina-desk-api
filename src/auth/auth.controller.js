const router = require('express').Router();
const { validateAuthUser } = require('./auth.middleware');
const AuthService = require('./auth.service');
const { asyncWrapper } = require('../utils/util.functions');
const HttpStatus = require('http-status-codes');

router.post('/auth/login', validateAuthUser, asyncWrapper(AuthService.login));

router.post('/auth/logout', asyncWrapper(AuthService.logout));

router.post('/auth/validate-token', (req, res) => res.status(HttpStatus.OK).send())

module.exports = router;
