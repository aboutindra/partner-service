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
        const error = wrapper.error(new BadRequestError(ResponseMessage.INVALID_INPUT_PARAMETER));
        error.data = errors.array();
        wrapper.response(response, false, error);
        return;
    }
    request.body.startDate = new Date(request.body.startDate);
    request.body.endDate = new Date(request.body.endDate);

    const currentPartnerProgram = await partnerProgram.getActivePartnerProgram(request.body.partnerCode, request.body.startDate, request.body.endDate);
    if (currentPartnerProgram.err && currentPartnerProgram.err.message !== "Active partner program not found") {
        wrapper.response(response, false, currentPartnerProgram);
        return;
    } else if (currentPartnerProgram.data) {
        wrapper.response(response, false, wrapper.error(new ForbiddenError("There is another program currently running")));
        return;
    }

    const insertPartnerProgramResult = await partnerProgram.insertProgram(request.body);
    if (insertPartnerProgramResult.err) {
        wrapper.response(response, false, insertPartnerProgramResult);
    } else {
        wrapper.response(response, true, insertPartnerProgramResult, "Partner program added", successCode.CREATED);
    }
}

const softDeleteProgram = async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        const error = wrapper.error(new BadRequestError(ResponseMessage.INVALID_INPUT_PARAMETER));
        error.data = errors.array();
        wrapper.response(response, false, error);
        return;
    }

    const id = parseInt(request.params.id);
    const deletePartnerProgramResult = await partnerProgram.softDeleteProgram(id);

    if (deletePartnerProgramResult.err) {
        wrapper.response(response, false, deletePartnerProgramResult);
    } else {
        wrapper.response(response, true, deletePartnerProgramResult, "Partner program deleted", successCode.OK);
    }
}

const getPrograms = async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        const error = wrapper.error(new BadRequestError(ResponseMessage.INVALID_INPUT_PARAMETER));
        error.data = errors.array();
        wrapper.response(response, false, error);
        return;
    }

    const { id, page, limit, offset, search } = request.query;
    let getPartnerProgramsResult;

    if (id) {
        getPartnerProgramsResult = await partnerProgram.getProgramById(parseInt(id));
    } else {
        getPartnerProgramsResult = await partnerProgram.getAllProgram(page, limit, offset, search);
    }

    if (getPartnerProgramsResult.err) {
        wrapper.response(response, false, getPartnerProgramsResult);
    } else {
        wrapper.paginationResponse(response, true, getPartnerProgramsResult, "Partner program(s) retrieved", successCode.OK);
    }
}

const getPartnerPrograms = async (request, response) => {
    const { page, limit, offset } = request.query;
    const { partnerCode } = request.params;
    const getPartnerProgramResult = await partnerProgram.getPartnerProgram(partnerCode.toUpperCase(), page, limit, offset);

    if (getPartnerProgramResult.err) {
        wrapper.response(response, false, getPartnerProgramResult);
    } else {
        wrapper.paginationResponse(response, true, getPartnerProgramResult, "Partner program(s) retrieved", successCode.OK);
    }
}

module.exports = {
    insertProgram,
    softDeleteProgram,
    getPrograms,
    getPartnerPrograms
}
