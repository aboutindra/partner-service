const wrapper = require('../utilities/wrapper');
const { validationResult } = require('express-validator');
const { ERROR:erroCode, SUCCESS:successCode } = require('../utilities/httpStatusCode');
const { NotFoundError,InternalServerError,ConflictError,BadRequestError,ForbiddenError } = require('../utilities/error');
const PartnerQuota = require('../databases/postgresql/models/partnerQuota');
const partnerQuota = new PartnerQuota(process.env.POSTGRESQL_DATABASE_PARTNER);

const upsertQuota = async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        let error = wrapper.error(new BadRequestError("Invalid input parameter"));
        error.data = errors.array();
        wrapper.response(response, false, error);
        return;
    }

    let { partnerCode, remainingQuotaPerDay, remainingQuotaPerMonth } = request.body;

    let result = await partnerQuota.upsertQuota(partnerCode, remainingQuotaPerDay, remainingQuotaPerMonth);
    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Partner quota added", successCode.CREATED);
    }
}

const deductQuota = async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        let error = wrapper.error(new BadRequestError("Invalid input parameter"));
        error.data = errors.array();
        wrapper.response(response, false, error);
        return;
    }

    let partnerCode = request.params.partnerCode;
    let { dailyQuotaDeduction, monthlyQuotaDeduction } = request.body;

    let result = await partnerQuota.deductQuota(partnerCode, dailyQuotaDeduction, monthlyQuotaDeduction);
    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Partner quota deducted", successCode.OK);
    }
}

const getRemainingQuota = async (request, response) => {
    let partnerCode = request.params.partnerCode;
    let result = await partnerQuota.getQuotaByPartnerCode(partnerCode);

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Partner quota(s) retrieved", successCode.OK);
    }
}

const getAllRemainingQuota = async (request, response) => {
    let result = await partnerQuota.getAllQuota();

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Partner quota(s) retrieved", successCode.OK);
    }
}

module.exports = {
    upsertQuota,
    deductQuota,
    getRemainingQuota,
    getAllRemainingQuota
}