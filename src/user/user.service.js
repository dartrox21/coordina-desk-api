const GenericService = require('../generics/GenericService');
const CustomValidateException = require('../exceptionHandler/CustomValidateException');
const CustomErrorMessages = require('../exceptionHandler/CustomErrorMessages');
const HttpStatus = require('http-status-codes');
const UserRepository = require('./user.repository');
const User = require('./User.model');
const userProjection = require('./projections/user.projection');
const userLoginProjection = require('./projections/userLogin.projection');
const ActivationMailService = require('../mail/activation.mail.service');
const { encrypt } = require('../utils/util.functions');

class UserSevice extends GenericService {
    constructor() {
        super(User);
        this.create = this.create.bind(this);
        this.uniqueValidateException = this.uniqueValidateException.bind(this);
        this.getById = this.getById.bind(this);
        this.delete = this.delete.bind(this);
        this.findByIdAndValidate = this.findByIdAndValidate.bind(this);
        this.update = this.update.bind(this);
    }

    /**
     * Finds a user in the database based on the email
     * @param User user object
     * @throws CustomValidateException if the user with the email exists
    */ 
    async uniqueValidateException(user) {
        console.log('uniqueValidateException UserSevice');
        let found = await UserRepository.findByEmail(user.email);
        if(found !== null) {
            throw CustomValidateException.conflict().errorMessage(CustomErrorMessages.EMAIL_ALREADY_USE).build();
        }
    }
    
    /**
     * Service used to create a new user
     * @param req Request object
     * @param res Response object
     * @throws CustomValidateException CONFLICT if the email already exists
     * @throws CustomValidateException BAD REQUEST if Mongoose throws an error
     * @returns Response 201 CREATED with the user created
    */
    async create(req, res) {
        console.log('create UserSevice');
        const user = req.body;
        await this.uniqueValidateException(user);
        const userCreated = await UserRepository.save(user);
        await ActivationMailService.sendMail(userCreated.email, userCreated._id);
        res.status(HttpStatus.CREATED).json(userCreated);
    }

    /**
     * Service used to find a user by id
     * @param req Request object
     * @param res Response object
     * @returns 404 NOT FOUND if the user is not found
     * @returns 200 OK If the user is found
     */
    async getById(req, res) {
        console.log('getById UserSevice');
        const user = await this.findByIdAndValidate(req.params.id);
        res.status(HttpStatus.OK).json(user);
    }

    /**
     * Serivce used to logically deletes a user setting its flag active to false
     * @param req Request object
     * @param res Response object
     * @returns 404 NOT FOUND if the user is not found
     * @returns 200 OK If the user is deleted successfully
     */
    async delete(req, res) {
        console.log('delete UserSevice');
        await this.findByIdAndValidate(req.params.id);
        await UserRepository.delete(req.params.id);
        res.status(HttpStatus.OK).send();
    }

    /**
     * Service used to update a user.
     * Fields susch as _id and active cannot be updated
     * @param req Request object
     * @param res Response object
     * @returns 404 NOT FOUND if the user is not found
     * @returns 200 OK If the user is updated successfully
     */
    async update(req, res) {
        console.log('update UserSevice');
        const id = req.params.id;
        await this.findByIdAndValidate(id);
        const user = await UserRepository.update(id, req.body, userProjection);
        res.status(HttpStatus.OK).json(user);
    }

    /**
     * Service used to find an user by id
     * @param req Request object
     * @param id 
     * @returns User found
     * @throws CustomValidateException 404 NOT FOUND if the user is not found
     */
    async findByIdAndValidate(id, projection = null) {
        console.log('findByIdAndValidate UserSevice');
        const user = await UserRepository.getById(id, userProjection);
        if(!user) {
            throw CustomValidateException.notFound().build();
        }
        return user;
    }

    /**
     * Finds and validates a user by its email
     * @param email 
     */
    async findByEmail(email) {
        console.log('findByEmail UserSevice');
        const user = await UserRepository.findByEmail(email, userLoginProjection);
        if(!user || !user.isActive) {
            throw CustomValidateException.notFound().errorMessage(CustomErrorMessages.USER_NOT_FOUND).build();
        }
        return user;
    }

    /**
     * Resends the activation email to the user.
     * Validates if the user is not active and if it is not deleted
     * @param  req 
     * @param  res 
     */
    async resendActivationEmail(req, res) {
        console.log('resendActivationEmail UserService');
        const user = await UserRepository.getByIdNoValidation(req.body._id);
        if(user.isActive) {
            throw CustomValidateException.conflict().errorMessage(CustomErrorMessages.USER_IS_ACTIVE).build();
        } else if(user.isDeleted) {
            throw CustomValidateException.conflict().errorMessage(CustomErrorMessages.USER_IS_DELETED).build();
        }
        await ActivationMailService.sendMail(user.email, user._id);
        res.status(HttpStatus.OK).send();
    }

    /**
     * Activates the user account and sets its information
     * @param req Request object
     * @param res Response object
     * @returns 
     */
    async activate(req, res) {
        let user = req.body;
        const userDb = await UserRepository.getByIdNoValidation(user._id);
        if(!userDb) {
            throw CustomValidateException.notFound().setField('id').setValue(user._id).build();
        }
        if(userDb.isActive) {
            return res.status(HttpStatus.OK).json(userDb);
        }
        delete user.email;
        delete user.isDeleted;
        user.isActive = true;
        const hash = await encrypt(user.password);
        user.password = hash;
        user = await UserRepository.update(user._id, user);
        res.status(HttpStatus.OK).json(user);
    }
}

module.exports = new UserSevice();
