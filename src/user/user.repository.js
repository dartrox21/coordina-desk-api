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
     * Method used to count all the active users in the db
     */
    async countDocuments() {
        return User.countDocuments()
        .where('active').equals('true');
    }

    /**
     * Gets an active user by id 
     * @param id 
     * @param projection object. Can be null
     */
    async getById(id, projection) {
        return User.findById(id, projection)
        .where('active').equals('true');
    }

    /**
     * Logically deletes a user setting its flag active to false
     * @param id 
     */
    async delete(id) {
        return User.findByIdAndUpdate(id, {active: false}, {new: true});
    }

    /**
     * Update a user
     * @param id 
     * @param User user object
     * @param projection object. Can be null
     */
    async update(id, user, projection) {
        delete user.active;
        delete user._id;
        return User.findByIdAndUpdate(id, user, {new: true, projection});
    }
}

module.exports = new UserRepository();
