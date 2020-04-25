const wrapper = require('../utilities/wrapper');
const { validationResult } = require('express-validator');
const { SUCCESS:successCode } = require('../enum/httpStatusCode');
const ResponseMessage = require('../enum/httpResponseMessage');
const { BadRequestError,ForbiddenError } = require('../utilities/error');
const PartnerProgram = require('../databases/postgresql/models/partnerProgram');
const partnerProgram = new PartnerProgram(process.env.POSTGRESQL_DATABASE_PARTNER);

/* istanbul ignore next */
const insertProgram = async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        let error = wrapper.error(new BadRequestError(ResponseMessage.INVALID_INPUT_PARAMETER));
        error.data = errors.array();
        wrapper.response(response, false, error);
        return;
    }

    let currentPartnerProgram = await partnerProgram.getActivePartnerProgram(request.body.partnerCode);
    if (currentPartnerProgram.err && currentPartnerProgram.err.message !== "Active partner program not found") {
        wrapper.response(response, false, currentPartnerProgram);
        return;
    } else {
        if (currentPartnerProgram.data) {
            wrapper.response(response, false, wrapper.error(new ForbiddenError("There is another program currently running")));
            return;
        }
    }

    request.body.startDate = new Date(request.body.startDate);
    request.body.endDate = new Date(request.body.endDate);
    let insertPartnerProgramResult = await partnerProgram.insertProgram(request.body);
    if (insertPartnerProgramResult.err) {
        wrapper.response(response, false, insertPartnerProgramResult);
    } else {
        wrapper.response(response, true, insertPartnerProgramResult, "Partner program added", successCode.CREATED);
    }
    return;
}

const softDeleteProgram = async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        let error = wrapper.error(new BadRequestError(ResponseMessage.INVALID_INPUT_PARAMETER));
        error.data = errors.array();
        wrapper.response(response, false, error);
        return;
    }

    let id = parseInt(request.params.id);
    let deletePartnerProgramResult = await partnerProgram.softDeleteProgram(id);

    if (deletePartnerProgramResult.err) {
        wrapper.response(response, false, deletePartnerProgramResult);
    } else {
        wrapper.response(response, true, deletePartnerProgramResult, "Partner program deleted", successCode.OK);
    }
    return;
}

const getPrograms = async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        let error = wrapper.error(new BadRequestError(ResponseMessage.INVALID_INPUT_PARAMETER));
        error.data = errors.array();
        wrapper.response(response, false, error);
        return;
    }

    let getPartnerProgramsResult;

    if (request.query.id) {
        let id = parseInt(request.query.id);
        getPartnerProgramsResult = await partnerProgram.getProgramById(id);
    } else {
        let {page, limit, offset} = request.query;
        getPartnerProgramsResult = await partnerProgram.getAllProgram(page, limit, offset);
    }

    if (getPartnerProgramsResult.err) {
        wrapper.response(response, false, getPartnerProgramsResult);
    } else {
        wrapper.paginationResponse(response, true, getPartnerProgramsResult, "Partner program(s) retrieved", successCode.OK);
    }
    return;
}

const getPartnerPrograms = async (request, response) => {
    let {page, limit, offset} = request.query;
    let partnerCode = request.params.partnerCode.toUpperCase();
    let getPartnerProgramResult = await partnerProgram.getPartnerProgram(partnerCode, page, limit, offset);

    if (getPartnerProgramResult.err) {
        wrapper.response(response, false, getPartnerProgramResult);
    } else {
        wrapper.paginationResponse(response, true, getPartnerProgramResult, "Partner program(s) retrieved", successCode.OK);
    }
    return;
}

module.exports = {
    insertProgram,
    softDeleteProgram,
    getPrograms,
    getPartnerPrograms
}
