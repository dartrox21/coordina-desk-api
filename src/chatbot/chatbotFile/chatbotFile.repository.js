const GenericRepository = require("../../generics/GenericRepository");
const chatbotFile = require("./chatbotFile.model");



class ChatbotFileRepository extends GenericRepository {
    constructor() {
        super(chatbotFile);
    }
}

module.exports = new ChatbotFileRepository();