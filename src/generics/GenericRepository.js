/**
 * Generic class to handle requests to the DB 
 * In the cosntructor receives a mongoose object Schema
 */
class GenericRepository {
    Schema;
    constructor(Schema) {
        this.Schema = Schema;
    }

    /**
     * Saves a object in the db
     * @param object object to save
     * @returns Object created
     */
    async save(object) {
        return new this.Schema(object).save();
    }

    /**
     * Method used to get the list of objects from the db
     * @param Object filters 
     * @param Projection projection object. Can be null
     * @returns List list of objects found
     */
    async getAll(filters = Object, projection = null) {    
        return this.Schema.find(filters).select(projection);
    }

    /**
     * Method used to get the list of object but with params
     * such as limimt & page
     * 
     * In the for method we modify the filters query to be search using a regex
     * similar to a like operator in sql
     * @param limit Limit number of resultes
     * @param page skip n number of results
     * @param filters filters object
     * @param projection projection object
     * @returns List list of objects found
     */
    async getAllPageable(limit, page, filters, projection = null) {
        page = page * limit;
        return this.Schema.find(this.createFilterList(filters))
            .select(projection)
            .limit(limit)
            .skip(page);
    }

    /**
     * Method used to count the element in the db collection
     */
    async countDocuments(filters = null) {
        return this.Schema.countDocuments(this.createFilterList(filters));
    }

    /**
     * Gets a object by id 
     * @param id 
     * @param projection object. Can be null
     */
    async getById(id, projection = null) {
        return this.Schema.findById(id, projection);
    }

    /**
     * Update an object
     * @param id id
     * @param Object object
     * @param projection object. Can be null
     * @returns updated object
     */
    async update(id, object = Object, projection = null) {
        delete object._id;
        return this.Schema.findByIdAndUpdate(id, object, {new: true, projection});
    }

    async updateMany(filter = Object, toUpdate = Object) {
        delete filter._id;
        return this.Schema.updateMany(filter, toUpdate);
    }

    async delete(_id) {
        return this.Schema.deleteOne({_id});
    }

    /**
     * Creates a list of filter adding regex operator and or operator
     * @param  filters 
     * @returns 
     */
    createFilterList = (filters) => {
        let filtersList = [];
        for (const property in filters) {
            if(typeof filters[property] !== 'boolean') {
                const filter = {}
                filter[property] = {$regex: filters[property], $options: 'i'};
                filtersList.push(filter);
            } else {
                filtersList.push(filters);
            }
        }
        return filtersList.length > 0 ?  { $or: filtersList} : {};
    }
}


module.exports = GenericRepository;
