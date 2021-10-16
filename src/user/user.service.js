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
const { pick } = require('underscore');

class UserSevice extends GenericService {
    constructor() {
        super(User);
    }

    /**
     * Finds a user in the database based on the email
     * @param User user object
     * @throws CustomValidateException if the user with the email exists
    */ 
    uniqueValidateException = async (user) => {
        console.log('uniqueValidateException UserSevice');
        const found = await UserRepository.findByEmail(user.email);
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
    create = async (req, res) => {
        console.log('create UserSevice');
        const user = new User();
        user.email = req.body.email.trim().toLowerCase();;
        user.role = req.body.role;
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
    getById = async (req, res) => {
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
    delete = async (req, res) => {
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
    update = async (req, res) => {
        console.log('update UserSevice');
        const id = req.params.id;
        const user = this.updateUser(req.body, id);
        res.status(HttpStatus.OK).json(user);
    }

    updateUser = async (user, id) => {
        await this.findByIdAndValidate(id);
        return await UserRepository.update(id, user, userProjection);
    }

    /**
     * Finds and validates a user by its email
     * @param email 
     */
    findByEmail = async (email) => {
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
    resendActivationEmail = async (req, res) => {
        console.log('resendActivationEmail UserService');
        const user = await UserRepository.getByIdNoValidation(req.body._id);
        if(user.isActive) {
            throw CustomValidateException.conflict().errorMessage(CustomErrorMessages.USER_IS_ACTIVE).build();
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
    activate = async (req, res) => {
        let user = req.body;
        const userDb = await UserRepository.getByIdNoValidation(user._id);
        if(!userDb) {
            throw CustomValidateException.notFound().setField('id').setValue(user._id).build();
        }
        if(userDb.isActive) {
            delete userDb.password;
            return res.status(HttpStatus.OK).json(userDb);
        }
        delete user.email;
        user.isActive = true;
        const hash = await encrypt(user.password);
        user.password = hash;
        user = await UserRepository.update(user._id, user, userProjection);
        res.status(HttpStatus.OK).json(user);
    }


    /**
     * Find all the active and not deleted users that match with the given role
     * and that has the less tickets asigned
     * @param Projection projection 
     * @returns List of Users
     */
    findUserByRoleWithLessTickets = async (role) => {
        let users =  await UserRepository.getAll({isActive: true, role: role}, ['tickets']);
        console.log(users);
        users = users.sort((a, b) => (a.ticketsCount > b.ticketsCount) ? 1 : -1);
        return users[0];
    }

    /**
     * Get all the active and non deleted users
     * @param Request object req 
     * @param Response object res 
     */
    getAll = async (req, res) => {
        console.log('GetAll UserService');
        console.log(req.query.filters);
        let filters = req.query.filters || {};
        filters.isActive = true;
        const userList = await super.getAllObjects(filters, userProjection);
        super.getListResponse(res, userList);
    }

    /**
     * Get pageable all the active and non deleted users
     * @param Request object req 
     * @param Response object res 
     */
    getAllPageable = async (req, res) => {
        console.log('getAllPageable UserService');
        const limit = req.query.limit;
        const page = req.query.page;
        let filters = req.query.filters || {};
        const users =  await super.getAllObjectsPageable(limit, page, filters, userProjection);
        const totalDocuments = await UserRepository.countDocuments();
        this.getPageableResponse(res, users, page, limit, totalDocuments);
    }

    /**
     * Return a clean User object with the desired properties 
     * @param user 
     * @param properties 
     * @returns 
     */
    cleanUserObject(user, properties = []) {
        return pick(user, properties);
    }
}

module.exports = new UserSevice();
