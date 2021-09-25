const GenericRepository = require('./GenericRepository');
const HttpStatus = require('http-status-codes');
const { buildPageableResponse } = require('../utils/util.functions');
const CustomValidateException = require('../exceptionHandler/CustomValidateException');


/**
 * Generic class 
 * In the cosntructor receives a mongoose object Schema
 */
class GenericService {
    Schema;
    genericRepository;
    constructor(Schema) {
        this.genericRepository = new GenericRepository(Schema);
        this.Schema = Schema;
        this.create = this.create.bind(this);
        this.getAll = this.getAll.bind(this);
        this.getListResponse = this.getListResponse.bind(this);
        this.getAllPageable = this.getAllPageable.bind(this);
        this.getPageableResponse = this.getPageableResponse.bind(this);
        this.getById = this.getById.bind(this);
        this.findByIdAndValidate = this.findByIdAndValidate.bind(this);
        this.getAllObjects = this.getAllObjects.bind(this);
     }

    /**
     * ABSTRACT METHOD that must be implementedin the class where the GenericService extends
     * @param object to be validated
     */
    async uniqueValidateException(object) {
        throw new Error('Unique validate exeption must be implemented');
    }

    /**
     * Creates a object and saves it in the DB
     * @param req Request object
     * @param res Response object
     */
    async create(req, res) {
        console.log('Create generic');
        const object = req.body;
        await this.uniqueValidateException(object);
        res.status(HttpStatus.CREATED).json(await this.genericRepository.save(object));
    }

    /**
     * Get the list of all objects
     * @param req Request object
     * @param res Response object
     * @param projection projection object. Can be null
     * @returns 200 OK if the list is not empty.
     * @returns 204 NO CONTENT if the list is empty.
     */
    async getAll(req, res, next, projection = null) {
        console.log('getAll generic');
        const objectList = await this.genericRepository.getAll(req.query.filters, projection);
        this.getListResponse(res, objectList);
    }

    /**
     * Get the pageable list of all objects.
     * limit, page and filters are applied
     * @param req Request object
     * @param res Response object
     * @param projection projection object. Can be null
     * @returns 200 OK if the list is not empty.
     * @returns 204 NO CONTENT if the list is empty.
     */
    async getAllPageable(req, res, next, projection = null) {
        console.log('getAllPageable generic');
        const limit = req.query.limit;
        const page = req.query.page;
        const filters = req.query.filters;
        const objectList =  await this.genericRepository.getAllPageable(limit, page, filters, projection);
        const totalDocuments = await this.genericRepository.countDocuments();
        this.getPageableResponse(res, objectList, page, limit, totalDocuments);
    }

    async delete(req, res) {
        console.log('delete generic');
        res.json('delete generic');
    }

    async update(req, res) {
        console.log('update generic');
        res.json('update generic');
    }

    /**
     * Evaluates the content of the list and gives the correct response
     * @param res Response object
     * @param List objectList 
     * @returns 200 OK if there is at least one object in the list
     * @returns 204 NO CONTENT if the list is empty
     */
    async getListResponse(res, objectList) {
        console.log('getListResponse generic');
        if (objectList.length > 0) {
            res.status(HttpStatus.OK).json(objectList);
        } else {
            res.status(HttpStatus.NO_CONTENT).send();
        }
    }

    /**
     * Evaluates the content of the list and gives the correct response.
     * Also if the list has at least one object a pageable response object will be build
     * @param res Response object
     * @param List objectList 
     * @param page number
     * @param limit limit
     * @param totalDocuments total documents
     * @returns 200 OK if there is at least one object in the list
     * @returns 204 NO CONTENT if the list is empty
     */
    async getPageableResponse(res, objectList, page, limit, totalDocuments) {
        console.log('getPageableResponse generic');
        if (objectList.length > 0) {
            res.status(HttpStatus.OK).json(await buildPageableResponse(objectList, page, limit, totalDocuments));
        } else {
            res.status(HttpStatus.NO_CONTENT).send();
        }
    }

    async getById(req, res) {
        console.log('getById generic');
        const object = await this.genericRepository.getById(req.params.id);
        if (!object) {
            res.status(HttpStatus.NOT_FOUND).send();
        } else {
            res.status(HttpStatus.OK).json(object);
        }
    }

    /**
     * Service used to find an object by id
     * @param req Request object
     * @param id 
     * @returns Object found
     * @throws CustomValidateException 404 NOT FOUND if the object is not found
     */
    async findByIdAndValidate(id, projection = null) {
        console.log('findByIdAndValidate GenericService');
        const obj = await this.genericRepository.getById(id, projection);
        if(!obj) {
            throw CustomValidateException.notFound().build();
        }
        return obj;
    }

    /**
     * Get the list of all objects
     * @param filters object of filters
     * @param projection projection object. Can be null
     * @returns List of objects found
     */
    async getAllObjects(filters = Object, projection = null) {
        console.log('getAllObjects generic');
        return await this.genericRepository.getAll(filters, projection);
    }
}

module.exports = GenericService;
