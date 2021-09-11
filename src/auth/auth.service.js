const jwt = require('jsonwebtoken');
const HttpStatus = require('http-status-codes');
const CustomValidateException = require('../exceptionHandler/CustomValidateException');
const CustomErrorMessages = require('../exceptionHandler/CustomErrorMessages');
const UserService = require('../user/user.service');
const bcrypt = require('bcrypt');
const TokenService = require('./token/token.service')

class AuthService {
    constructor() { 
        this.login = this.login.bind(this);
     }

    async login(req, res, next) {
        console.log('login AuthSevice');
        const userLogin = req.body;
        let user = await UserService.findByEmail(req.body.email);
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
}

module.exports = new AuthService();
