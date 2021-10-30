const router = require('express').Router();
const { asyncWrapper, preAuthorize } = require('../utils/util.functions');
const { setFilters } = require('../middlewares/util.middlewares');
const ChatbotService = require('./chatbot.service');
const ROLE = require('../role/Role.enum');
const ChatbotFileService = require('./chatbotFile/chatbotFile.service');


router.post('/chatbot/evaluate', asyncWrapper(ChatbotService.evaluateQuestion));
const FILTERS = ['name'];

router.get('/chatbot/files/all/pageable',
    [preAuthorize(ROLE.COORDINATOR, ROLE.ASSISTANT), setFilters(FILTERS)],
    asyncWrapper(ChatbotFileService.getAllFilesPageable));

router.get('/chatbot/generate-current',
    [preAuthorize(ROLE.COORDINATOR)],
    asyncWrapper(ChatbotService.generateCurrentDataFile));

module.exports = router;