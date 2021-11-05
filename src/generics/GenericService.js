const GenericRepository = require('./GenericRepository');
const HttpStatus = require('http-status-codes');
const { buildPageableResponse } = require('../utils/util.functions');
const CustomValidateException = require('../exceptionHandler/CustomValidateException');
const CustomErrorMessages = require('../exceptionHandler/CustomErrorMessages');


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
     }

    /**
     * ABSTRACT METHOD that must be implementedin the class where the GenericService extends
     * @param object to be validated
     */
    uniqueValidateException = async (object) => {
        throw new Error('Unique validate exeption must be implemented');
    }

    /**
     * Creates a object and saves it in the DB
     * @param req Request object
     * @param res Response object
     */
    create = async (req, res) => {
        console.log('Create generic');
        const object = req.body;
        await this.uniqueValidateException(object);
        res.status(HttpStatus.CREATED).json(await this.genericRepository.save(object));
    }

    /**
     * Creates a object and saves it in the DB
     * @param req Request object
     * @param res Response object
     */
    createObject = async (object) => {
        console.log('CreateObject generic');
        await this.uniqueValidateException(object);
        return await this.genericRepository.save(object);
    }

    /**
     * Get the list of all objects
     * @param req Request object
     * @param res Response object
     * @param projection projection object. Can be null
     * @returns 200 OK if the list is not empty.
     * @returns 204 NO CONTENT if the list is empty.
     */
    getAll = async (req, res, next, projection = null) => {
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
    getAllPageable = async(req, res, next, projection = null) => {
        console.log('getAllPageable generic');
        const limit = req.query.limit;
        const page = req.query.page;
        const filters = req.query.filters;
        const objectList =  await this.genericRepository.getAllPageable(limit, page, filters, projection);
        const totalDocuments = await this.genericRepository.countDocuments(filters);
        this.getPageableResponse(res, objectList, page, limit, totalDocuments);
    }

    countDocuments = async (filters = {}) => {
        return await this.genericRepository.countDocuments(filters);
    }

    delete = async (req, res) => {
        console.log('delete generic');
        const id = req.params.id;
        await this.findByIdAndValidate(id);
        await this.genericRepository.delete(id);
        return res.status(HttpStatus.OK).send();
    }

    deleteObject = async (id) => {
        console.log('deleteObject generic');
        await this.genericRepository.delete(id);
    }

    update = async (req, res) => {
        console.log('update generic');
        const id = req.params.id;
        await this.findByIdAndValidate(id);
        await this.uniqueValidateException(req.body);
        if(id !== req.body._id) {
            throw CustomValidateException.conflict().errorMessage(CustomErrorMessages.ID_NOT_MATCH)
                .setField('id').setValue(`${id} !== ${req.body._id}`).build();
        }
        res.status(HttpStatus.OK).json(await this.updateObject(req.body));
    }

    /**
     * Evaluates the content of the list and gives the correct response
     * @param res Response object
     * @param List objectList 
     * @returns 200 OK if there is at least one object in the list
     * @returns 204 NO CONTENT if the list is empty
     */
    getListResponse = async (res, objectList) => {
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
    getPageableResponse = async (res, objectList, page, limit, totalDocuments) => {
        console.log('getPageableResponse generic');
        if (objectList.length > 0) {
            res.status(HttpStatus.OK).json(await buildPageableResponse(objectList, page, limit, totalDocuments));
        } else {
            res.status(HttpStatus.NO_CONTENT).send();
        }
    }

    getById = async (req, res) => {
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
    findByIdAndValidate = async (id, projection = null) => {
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
    getAllObjects = async (filters = Object, projection = null) => {
        console.log('getAllObjects generic');
        return await this.genericRepository.getAll(filters, projection);
    }

    /**
     * Get the pageable list of all objects.
     * limit, page and filters are applied
     * @param limit limit of elements to return default to 10
     * @param page page to return dedault to 1
     * @param filters filters Object
     * @param projection projection object. Can be null
     * @returns List of objects
     */
    getAllObjectsPageable = async (limit = 10, page = 1, filters = Object, projection = null) => {
        console.log('getAllObjectsPageable generic');
        return await this.genericRepository.getAllPageable(limit, page, filters, projection);
    }

    /**
     * Update many records
     * @param query param to validate wht to filter filter 
     * @param property that must be filtered toUpdate 
     * @returns 
     */
    updateMany = async (filter, toUpdate = Object) => {
        console.log('updateMany GenericService');
        return await this.genericRepository.updateMany(filter, toUpdate);
    }

    /**
     * Update a simple object
     * @param Object object to be updated
     * @returns objectr updated
     */
    updateObject = async(object) => {
        console.log('updateObject GenericService');
        return await this.genericRepository.update(object._id, object);
    }
}

module.exports = GenericService;
