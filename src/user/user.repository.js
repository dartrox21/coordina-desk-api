const User = require('./User.model');
const GenericRepository = require('../generics/GenericRepository');

/**
 * Class used to manage all the User requests to the DB
 */
class UserRepository extends GenericRepository {

    constructor() {
        super(User);
    }

    /**
     * Method to find a user by email
     * @param Email email 
     */
    async findByEmail(email, projection) {
        return User.findOne({email: email}, projection);
    }

    /**
     * Gets an active user by id 
     * @param id 
     * @param projection object. Can be null
     */
    async getById(id, projection) {
        return User.findById(id, projection)
        .where('isActive').equals('true');
    }

    /**
     * Logically deletes a user setting its flag active to false
     * @param id 
     */
    async deactivate(id) {
        return User.findByIdAndUpdate(id, {isActive: false}, {new: true});
    }

    /**
     * Gets an user by id 
     * @param id 
     * @param projection object. Can be null
     */
    async getByIdNoValidation(id, projection) {
        return User.findById(id, projection);
    }
}

module.exports = new UserRepository();
