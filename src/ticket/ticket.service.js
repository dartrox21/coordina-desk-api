const GenericService = require("../generics/GenericService");
const Ticket = require('./Ticket.model');
const HttpStatus = require('http-status-codes');
const ticketRepository = require('./ticket.repository');
const ticketCreation = require("../mail/ticketCreation.mail.service");
const { STATUS } = require('./Status.enum');
require('./ticketContent/TicketContet.model');
const ticketDashboardProjection = require('./projections/ticketDashboard.projections');
const ticketContentService = require('./ticketContent/ticketContent.service.js ');
const userService = require("../user/user.service");
const ROLE = require("../role/Role.enum");
const userProjection = require("../user/projections/user.projection");
const nlpService = require("../nlp/nlp.service");
const PRIORITY = require("./Priority.enum");
const updateTicketMailService = require("../mail/updateTicket.mail.service");
const CustomValidateException = require("../exceptionHandler/CustomValidateException");
const { StemmerEs, StopwordsEs } = require('@nlpjs/lang-es');
const stringSimilarity = require('string-similarity');
const CustomErrorMessages = require("../exceptionHandler/CustomErrorMessages");
const HighPriorityClassificationService = require("./highPriorityClassification/HighPriorityClassification.service");




// Helper class
class DashBoard {
    todo = new Array();
    inProgress = new Array();
    done = new Array();
}

class TicketService extends GenericService {

    stemmer = new StemmerEs();

    constructor() {
        super(Ticket);
        this.stemmer.stopwords = new StopwordsEs();
    }

    uniqueValidateException = async () => {
        // IMPLEMENT IF NECESARY
    }

    create = async (req, res) => {
        console.log('Creating a ticket TicketService');
        const ticket = await ticketRepository.save(req.body);
        await ticketCreation.sendMail(ticket);
        res.status(HttpStatus.CREATED).json(ticket);
        this.evaluate(ticket);
    }

    /**
     * Evaluates the ticket according its sentiment score and if anny of the high classifications 
     * is in the ticket title or description 
     * @param Ticket ticket 
     */
    evaluate = async (ticket) => {
        console.log(`Evaluating ticket: ${ticket._id}`);
        ticket.priority = await this.getPriority(ticket);
        let role = ROLE.ASSISTANT;
        if(ticket.priority == PRIORITY.HIGH) {
            role = ROLE.COORDINATOR;
        }
        const user = await userService.findUserByRoleWithLessTickets(role, userProjection);
        if(user != null) {
            await this.assignTicket(ticket, user, STATUS.ASIGNED);
        } else {
            await ticketRepository.update(ticket._id, ticket);
        }
        await updateTicketMailService.sendMail(ticket);
    }

    /**
     * Normalizing, Tokenizing and Stemming a sentence: 
     *  - https://developer.aliyun.com/mirror/npm/package/@nlpjs/lang-es
     *  - https://github.com/axa-group/nlp.js/blob/master/packages/lang-es/README.md#normalization
     * 
     * Find String Similarity
     *      https://www.npmjs.com/package/string-similarity
     *      Finds degree of similarity between two strings, based on Dice's Coefficient, which is mostly better than Levenshtein distance.
     * 
     * 
     * 1.- Evaluates the ticket title with the nlp to get a sentiment score.
     * 2.- tokenize, Stem and remove stopwords from the ticket title and description
     * 3.- tokenize, Stem and remove stopwords from each HighPriorityClassification
     * 4.- Finds the best match for the title and description compared against each HighPriorityClassification if the rating is
     *      higher than 0.8 then it is going to be more probable to be a high classification
     *      (A fraction from 0 to 1, both inclusive. Higher number indicates more similarity.)
     * @param Ticket ticket 
     * @returns PRIORITY
     */
    getPriority = async (ticket) => {
        const titleEvaluation = await nlpService.evaluateData(ticket.title);
        let score = titleEvaluation.sentiment.score;
        const title = this.stemmer.tokenizeAndStem(ticket.title.toLowerCase(), false);
        const description = this.stemmer.tokenizeAndStem(ticket.description.toLowerCase(), false);
        const highPriorityClassifications = await HighPriorityClassificationService.getAllObjects();
        let keywords = highPriorityClassifications.map(c => c.keyword);
        keywords = this.stemmer.tokenizeAndStem(keywords.join(' '), false);
        score += title.some(t => stringSimilarity.findBestMatch(t, keywords).bestMatch.rating > 0.8) ? -0.3 : 0.3;
        score += description.some(d => stringSimilarity.findBestMatch(d, keywords).bestMatch.rating > 0.8) ? -0.4 : 0.4;
        console.log(`GIVEN SCORE: ${score}`);
        let priority = PRIORITY.LOW;
        if(score < -0.3) {
            priority = PRIORITY.HIGH;
        } else if(score < 0.3) {
            priority = PRIORITY.MODERATE;
        }
        return priority;
    }

    /**
     * the ticket schema ans user schema is updated with its corresponding
     * _ids references
     * @param ticket 
     * @param user 
     * @param status 
     */
    assignTicket = async (ticket, user, status) => {
        console.log(`Asigning ticket: ${ticket._id} to user ${user._id}`);
        user.tickets.push(ticket._id);
        await userService.updateUser(user, user._id);
        ticket.status = status;
        ticket.user = user._id;
        await ticketRepository.update(ticket._id, ticket);
    }

    /**
     * Returns all the tickets from the dashboard
     * 
     * // COLUMNS: TODO, IN_PROGRESS, DONE
     *    - TODO ref to          STATUS (WAITING_ASIGNATION, ASIGNED)
     *    - IN_PROGRESS ref to   STATUS (IN_PROGRESS)
     *    - DONE ref to          STATUS (RESOLVE, FINAL_RESOLVE)
     * @param RequestObj req 
     * @param ResponseObj res 
     */
    dashboard = async (req, res) => {
        console.log('get dashboard tickets TicketSerivce');
        const response = new DashBoard();
        req.query.filters.isActive = true;
        let tickets = await ticketRepository.getAll(req.query.filters, ticketDashboardProjection);
        // If a deep copy is not made when creating a copy of a user and reasigning it to the ticket it causes that a new id is being created for the user prop
        tickets = JSON.parse(JSON.stringify(tickets));
        tickets.forEach(ticket  => {
            ticket.user = userService.cleanUserObject(ticket.user, userProjection);
            switch(ticket.status) {
                case STATUS.WAITING_ASIGNATION:
                case STATUS.ASIGNED:
                    response.todo.push(ticket);
                    break;
                case STATUS.IN_PROGRESS:
                case STATUS.WAITING_RESPONSE:
                    response.inProgress.push(ticket);
                    break;
                case STATUS.RESOLVE:
                case STATUS.FINAL_RESOLVE:
                    response.done.push(ticket);
                    break;
            }
        });
        res.status(HttpStatus.OK).json(response);
    }

    /**
     * see doc method postAnswer
     * @param Request obj req 
     * @param Response obj res 
     * @returns Ticket with the data
     */
    postStudentAnswer = async (req, res) => {
        console.log('postStudentAnswer TicketService');
        req.body.isUser = false;
        await this.postAnswer(req, res, STATUS.IN_PROGRESS);
    }

    /**
     * see doc method postAnswer
     * @param Request obj req 
     * @param Response obj res 
     * @returns Ticket with the data
     */
    postUserAnswer = async (req, res) => {
        console.log('postUserAnswer TicketService');
        const user = await userService.findByIdAndValidate(req.params.userId);
        req.body.username = user.name;
        req.body.isUser = true;
        await this.postAnswer(req, res, STATUS.WAITING_RESPONSE);
        let ticket = await this.findByIdAndValidate(req.params.id);
        await updateTicketMailService.sendMail(ticket);
    }

    /**
     * Validates that the ticket exists.
     * Sets the status to in progress if it is different to resolve
     * @param Request obj req 
     * @param Response obj res 
     * @returns Ticket with the data
     */
    postAnswer = async (req, res, status) => {
        let ticket = await this.findByIdAndValidate(req.params.id);
        if(!req.body.isUser && this.isFinalStatus(ticket)) {
            throw CustomValidateException.conflict().errorMessage(CustomErrorMessages.UNABLE_TO_REOPEN)
                .setField('status').setValue(ticket.status).build();
        }
        if(ticket.status !== STATUS.ASIGNED && ticket.status !== STATUS.WAITING_ASIGNATION) {
            ticket.status = status;
        }
        req.body.username = req.body.username == undefined ? ticket.name : req.body.username;
        const ticketContent = await ticketContentService.save(req.body);
        ticket.ticketContent.push(ticketContent);
        ticket = await ticketRepository.save(ticket);
        return res.status(HttpStatus.CREATED).json(ticket);
    }

    /**
     * 
     * @param Request obj req 
     * @param Res obj res 
     * @returns Ticket reasignated
     * @throws 404 NOT FOUND if the userId or ticket id is not found
     */
    reasign = async (req, res) => {
        console.log('reasign TicketService');
        let ticket = await this.findByIdAndValidate(req.params.id);
        if(ticket.user) {
            await userService.removeTicket(ticket.user, ticket._id);
        } else {
            ticket.status = STATUS.ASIGNED;
        }
        const user = await userService.findByIdAndValidate(req.params.userId);
        user.tickets.push(ticket._id);
        await userService.updateUser(user, user._id);
        ticket.user = user;
        ticket = await ticketRepository.save(ticket);
        return res.status(HttpStatus.OK).json(ticket);
    }

    /**
     * 
     * @param Request obj req 
     * @param Response obj res 
     * @returns ticket reasigned
     * @throws  404 NOT FOUND if the ticket id is not found
     */
    changeStatus = async (req, res) => {
        console.log('changeStatus TicketService');
        let ticket = await this.findByIdAndValidate(req.params.id);
        ticket.status = req.body.status;
        ticket = await ticketRepository.save(ticket);
        res.status(HttpStatus.OK).json(ticket);
        await updateTicketMailService.sendMail(ticket);
    }

    /**
     * 
     * @param Req object req 
     * @param Res object res 
     * @returns 200 OK if the ticket has been deactivated
     * @returns 4040  NOT FOUND it the ticket id does no exist
     */
    deactivateTicket = async (req, res) => {
        console.log('deactivateTicket TicketService');
        let ticket = await this.findByIdAndValidate(req.params.id);
        await userService.removeTicket(ticket.user, ticket._id);
        ticket.isActive = false;
        ticket.status = STATUS.CLOSED_DUE_TO_INACTIVITY;
        await this.updateObject(ticket);
        res.status(HttpStatus.OK).send();
    }

    /**
     * Get all the unactive tickets
     * @returns 200 OK if the list is not empty.
     * @returns 204 NO CONTENT if the list is empty.
     */
    getAllInactiveTicketsPageable = async (req, res) => {
        console.log('getAllInactiveTicketsPageable TicketService');
        const limit = req.query.limit;
        const page = req.query.page;
        const filters = req.query.filters;
        filters.isActive = false;
        const tickets = await ticketRepository.getAllPageable(limit, page, filters, ticketDashboardProjection);
        tickets.forEach(ticket =>  {ticket.user = userService.cleanUserObject(ticket.user, userProjection);});
        const totalDocuments = await ticketRepository.countDocuments(filters);
        this.getPageableResponse(res, tickets, page, limit, totalDocuments);
    }

    /**
     * 
     * @param Request obj req 
     * @param Response obj res 
     * @returns ticket reasigned
     * @throws  404 NOT FOUND if the ticket id is not found
     */
    changePriority = async (req, res) => {
        console.log('changePriority TicketService');
        let ticket = await this.findByIdAndValidate(req.params.id);
        ticket.priority = req.body.priority;
        ticket = await ticketRepository.save(ticket);
        res.status(HttpStatus.OK).json(ticket);
    }

    /**
     * change the boolean flag hasEmailUpdates
     * @param Request obj req 
     * @param Response obj res 
     * @returns 200 OK
     * @throws  404 NOT FOUND if the ticket id is not found
     */
    changeEmailNotifications = async (req, res) => {
        console.log('changeEmailNotifications TicketService');
        let ticket = await this.findByIdAndValidate(req.params.id);
        ticket.hasEmailUpdates = !ticket.hasEmailUpdates;
        await ticketRepository.save(ticket);
        res.status(HttpStatus.OK).send();
    }


    /**
     * Validates if  the ticket has a final status
     * STATUS.FINAL_RESOLVE or STATUS.CLOSED_DUE_TO_INACTIVITY
     * @param Ticket ticket 
     * @returns boolean
     */
    isFinalStatus = (ticket) => {
        if(ticket.status === STATUS.FINAL_RESOLVE ||
            ticket.status === STATUS.CLOSED_DUE_TO_INACTIVITY) {
                return true;
        }
        return false;
    }

    /**
     * Validate that the udgId and ticket id match
     * @param Request req 
     * @param Response res  
     */
    getByIdAndUdgId = async (req, res) => {
        console.log('getByIdAndUdgId TicketService');
        console.log(req.params);
        const ticket = await this.findByIdAndValidate(req.params.id);
        console.log(ticket);
        if (!ticket || ticket.udgId != req.params.udgId) {
            res.status(HttpStatus.NOT_FOUND).send();
        } else {
            res.status(HttpStatus.OK).json(ticket);
        }
    }

}

module.exports = new TicketService();