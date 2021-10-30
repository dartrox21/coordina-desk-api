const router = require('express').Router();
const { asyncWrapper, preAuthorize } = require('../utils/util.functions');
const NlpService = require('./nlp.service');
const ROLE = require('../role/Role.enum');


router.post('/nlp/train', preAuthorize(ROLE.COORDINATOR, ROLE.ASSISTANT), asyncWrapper(NlpService.retrain));

module.exports = router;