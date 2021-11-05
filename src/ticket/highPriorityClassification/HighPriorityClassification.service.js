const HttpStatus = require("http-status-codes");
const GenericService = require("../../generics/GenericService");
const HighPriorityClassification = require("./HighPriorityClassification.model");
const CustomValidateException = require("../../exceptionHandler/CustomValidateException");
const CustomErrorMessages = require("../../exceptionHandler/CustomErrorMessages");


class HighPriorityClassificationService extends GenericService {
    constructor() {
        super(HighPriorityClassification);
    }

    uniqueValidateException = async (objectTbc) => {
        console.log('HighPriorityClassificationService uniqueValidateException');
        let classifications = await this.getAllObjects({keyword: objectTbc.keyword});
        if(objectTbc._id) {
            classifications = classifications.filter(c =>  c._id != objectTbc._id);
        }
        if(classifications.length > 0) {
            throw CustomValidateException.conflict()
                .errorMessage(CustomErrorMessages.MUST_BE_UNIQUE)
                .setField('keyword').setValue(objectTbc.keyword).build();
        }
    }

    /**
     * 
     * @param Request req 
     * @param Response res 
     * @returns 200 ok
     * @throws CONFLICT if there are 1 or less elements
     */
    delete = async (req, res) => {
        console.log('delete HighPriorityClassificationService');
        const id = req.params.id;
        await this.findByIdAndValidate(id);
        const numberOfElements = await this.countDocuments();
        if(numberOfElements <= 1) {
            throw CustomValidateException.conflict()
                .errorMessage(CustomErrorMessages.MUST_HAVE_AT_LEAST_ONE).send();
        }
        await this.deleteObject(id);
        return res.status(HttpStatus.OK).send();
    }
}

module.exports = new HighPriorityClassificationService();