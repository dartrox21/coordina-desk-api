const Ticket = require('./Ticket.model');
const GenericRepository = require('../generics/GenericRepository');

class TicketRepository extends GenericRepository {
    
    constructor() {
        super(Ticket);
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
       page = page >= 1 ? page * limit : 0;
       return this.Schema.find(this.createFilterList(filters))
           .select(projection)
           .limit(limit)
           .skip(page);
    }

    /**
     * Creates a list of filter adding regex operator and or operator
     * @param  filters 
     * @returns 
     */
    createFilterList = (filters) => {
       let filtersList = [];
       let isActiveProperty = {};
       for (const property in filters) {
           const filter = {}
           if(typeof filters[property] !== 'boolean') {
               filter[property] = {$regex: filters[property], $options: 'i'};
               filtersList.push(filter);
            } else {
                filter[property] = filters[property];
                isActiveProperty = filter;
            }
       }
       return filtersList.length > 0 ?  { $or: filtersList, ...isActiveProperty} : {...isActiveProperty};
    }

}

module.exports = new TicketRepository();