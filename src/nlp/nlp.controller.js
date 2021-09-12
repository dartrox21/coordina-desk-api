const router = require('express').Router();
const { asyncWrapper } = require('../utils/util.functions');
const NlpService = require('./nlp.service');

router.post('/nlp/evaluate', asyncWrapper(NlpService.evaluateQuestion));

module.exports = router;