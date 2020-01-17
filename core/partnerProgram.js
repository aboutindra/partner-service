const wrapper = require('../utilities/wrapper');
const { validationResult } = require('express-validator');
const { SUCCESS:successCode } = require('../utilities/httpStatusCode');
const { BadRequestError,ForbiddenError } = require('../utilities/error');
const PartnerProgram = require('../databases/postgresql/models/partnerProgram');
const partnerProgram = new PartnerProgram(process.env.POSTGRESQL_DATABASE_PARTNER);

const insertProgram = async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        let error = wrapper.error(new BadRequestError("Invalid input parameter"));
        error.data = errors.array();
        wrapper.response(response, false, error);
        return;
    }

    let { partnerCode, exchangeRate, minAmountPerTransaction, maxAmountPerTransaction, maxTransactionAmountPerDay, maxTransactionAmountPerMonth, startDate, endDate } = request.body;
    partnerCode = partnerCode.toUpperCase();

    let currentProgram = await partnerProgram.getActivePartnerProgram(partnerCode);
    if (currentProgram.err && currentProgram.err.message !== "Active partner program not found") {
        wrapper.response(response, false, currentProgram);
        return;
    } else {
        if (currentProgram.data.length > 0) {
            wrapper.response(response, false, wrapper.error(new ForbiddenError("There is another program currently running")));
            return;
        }
    }

    let result = await partnerProgram.insertProgram(partnerCode, exchangeRate, minAmountPerTransaction, maxAmountPerTransaction, maxTransactionAmountPerDay, maxTransactionAmountPerMonth, 
        new Date(startDate), new Date(endDate));
    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Partner program added", successCode.CREATED);
    }
    return;
}

const softDeleteProgram = async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        let error = wrapper.error(new BadRequestError("Invalid input parameter"));
        error.data = errors.array();
        wrapper.response(response, false, error);
        return;
    }

    let id = parseInt(request.params.id);
    let result = await partnerProgram.softDeleteProgram(id);
    
    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Partner program deleted", successCode.OK);
    }
    return;
}

const getPrograms = async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        let error = wrapper.error(new BadRequestError("Invalid input parameter"));
        error.data = errors.array();
        wrapper.response(response, false, error);
        return;
    }

    let result;

    if (request.query.id) {
        let id = parseInt(request.query.id);
        result = await partnerProgram.getProgramById(id);
    } else {
        let page = null;
        let limit = null;
        let offset = null;
        if (request.query.page && request.query.limit) {
            page = parseInt(request.query.page);
            limit = parseInt(request.query.limit);
            offset = limit * (page - 1);
        }

        result = await partnerProgram.getAllProgram(page, limit, offset);
    }

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.paginationResponse(response, true, result, "Partner program(s) retrieved", successCode.OK);
    }
    return;
}

const getPartnerPrograms = async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        let error = wrapper.error(new BadRequestError("Invalid input parameter"));
        error.data = errors.array();
        wrapper.response(response, false, error);
        return;
    }

    let page = null;
    let limit = null;
    let offset = null;
    if (request.query.page && request.query.limit) {
        page = parseInt(request.query.page);
        limit = parseInt(request.query.limit);
        offset = limit * (page - 1);
    }

    let partnerCode = request.params.partnerCode.toUpperCase();
    let result = await partnerProgram.getPartnerProgram(partnerCode, page, limit, offset);

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.paginationResponse(response, true, result, "Partner program(s) retrieved", successCode.OK);
    }
    return;
}

module.exports = {
    insertProgram,
    softDeleteProgram,
    getPrograms,
    getPartnerPrograms
}
