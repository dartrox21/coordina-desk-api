const router = require('express').Router();
const { asyncWrapper, preAuthorize } = require('../utils/util.functions');
const ChatbotService = require('./chatbot.service');
const ROLE = require('../role/Role.enum');


router.post('/chatbot/evaluate', asyncWrapper(ChatbotService.evaluateQuestion));

router.get('/chatbot/generate-current',
    [preAuthorize(ROLE.COORDINATOR)],
    asyncWrapper(ChatbotService.generateCurrentDataFile));

module.exports = router;