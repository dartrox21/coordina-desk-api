const Token = require('./Token.model');

class TokenRepository {

    constructor() {}
    
    /**
     * Saves a Token in the db
     * @param Token object to save
     * @returns Token created
     */
    async save(token) {
        return new Token(token).save();
    }

    /**
     * Finds a token in the db
     */
    async findOne(token) {
      return Token.findOne({token: token});
    }
}

module.exports = new TokenRepository();