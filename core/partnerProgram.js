const wrapper = require('../utilities/wrapper');
const { validationResult } = require('express-validator');
const { ERROR:errorCode, SUCCESS:successCode } = require('../utilities/httpStatusCode');
const { NotFoundError,InternalServerError,ConflictError,BadRequestError,ForbiddenError } = require('../utilities/error');
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
    if (currentProgram.data.length > 0) {
        wrapper.response(response, false, wrapper.error(new ForbiddenError("There is another program currently running")));
        return;
    }

    let result = await partnerProgram.insertProgram(partnerCode, exchangeRate, minAmountPerTransaction, maxAmountPerTransaction, maxTransactionAmountPerDay, maxTransactionAmountPerMonth, 
        startDate, endDate);
    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Partner program added", successCode.CREATED);
    }
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
}

const getPrograms = async (request, response) => {
    let result;

    if (request.query.id) {
        let id = parseInt(request.query.id);
        if (isNaN(id)) {
            wrapper.response(response, false, wrapper.error(new BadRequestError("Id must be an integer value")));
            return;
        }
        result = await partnerProgram.getProgramById(id);
    } else {
        result = await partnerProgram.getAllProgram();
    }

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Partner program(s) retrieved", successCode.OK);
    }
}

const getPartnerPrograms = async (request, response) => {
    let partnerCode = request.params.partnerCode;
    let result = await partnerProgram.getPartnerProgram(partnerCode);

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Partner program(s) retrieved", successCode.OK);
    }
}

module.exports = {
    insertProgram,
    softDeleteProgram,
    getPrograms,
    getPartnerPrograms
}
