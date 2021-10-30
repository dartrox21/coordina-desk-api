const router = require('express').Router();
const { asyncWrapper } = require('../utils/util.functions');
const ChatbotService = require('./chatbot.service');



router.post('/chatbot/evaluate', asyncWrapper(ChatbotService.evaluateQuestion));

module.exports = router;