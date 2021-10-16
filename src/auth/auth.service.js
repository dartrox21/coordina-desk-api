const jwt = require('jsonwebtoken');
const HttpStatus = require('http-status-codes');
const CustomValidateException = require('../exceptionHandler/CustomValidateException');
const CustomErrorMessages = require('../exceptionHandler/CustomErrorMessages');
const bcrypt = require('bcrypt');
const TokenService = require('./token/token.service');

class AuthService {
    constructor() { 
        this.login = this.login.bind(this);
     }

    async login(req, res, next) {
        console.log('login AuthSevice');
        const userLogin = req.body;
        const email = req.body.email.trim().toLowerCase();
        let user = await UserService.findByEmail(email);
        const hasValidCredentials = await bcrypt.compare(userLogin.password, user.password);
        if(!hasValidCredentials) {
            throw CustomValidateException.conflict().errorMessage(CustomErrorMessages.BAD_CREDENTIALS).build();
        }
        user = user.toObject();
        delete user.password;
        jwt.sign(user, process.env.SECRET, {expiresIn: process.env.EXP_DATE}, (err, token) => {
            if(err) {
                next(CustomValidateException.conflict().errorMessage(CustomErrorMessages.BAD_CREDENTIALS).build());
            } else {
                token = `Bearer ${token}`;
                res.setHeader('Authorization', token);
                res.status(HttpStatus.OK).json({user, token});
            }
        });
    }

    async logout(req, res, next) {
      console.log('logout AuthSevice');
      await TokenService.save(req, res, next);
    }

    async createToken(data) {
        console.log('creating a token');
        return jwt.sign({data}, process.env.SECRET, {expiresIn: process.env.EXP_DATE});
    }
}

module.exports = new AuthService();


// requiring elements at the very botton to avoid circular dependency
const UserService = require('../user/user.service');
