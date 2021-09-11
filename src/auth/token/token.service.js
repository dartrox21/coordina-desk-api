
const TokenRepository = require('./token.repository');
const Token = require('./Token.model')
const HttpStatus = require('http-status-codes');

class TokenService {
    constructor() { 
        this.save = this.save.bind(this);
        this.findOne = this.findOne.bind(this);
    }

    /**
     * Stores the useless token in the db
     */
    async save(req, res, next) {
      const token = new Token({token: req.headers.authorization.split(' ')[1]});
      await TokenRepository.save(token);
      res.status(HttpStatus.OK).send();
    }

    /**
     * Looks for a token. Gets the token from the headers
     * @Return Token found or null
     */
    async findOne(req, res, next) {
      const token = req.headers.authorization.split(' ')[1];
      return await TokenRepository.findOne(token);
    }


}

module.exports = new TokenService();