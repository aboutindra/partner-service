const wrapper = require('../utilities/wrapper');
const { validationResult } = require('express-validator');
const { SUCCESS:successCode } = require('../utilities/httpStatusCode');
const { BadRequestError } = require('../utilities/error');
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

    let upsertQuotaResult = await partnerQuota.upsertQuota(partnerCode, remainingQuotaPerDay, remainingQuotaPerMonth);
    if (upsertQuotaResult.err) {
        wrapper.response(response, false, upsertQuotaResult);
    } else {
        wrapper.response(response, true, upsertQuotaResult, "Partner quota added", successCode.CREATED);
    }
    return;
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

    let deductQuotaResult = await partnerQuota.deductQuota(partnerCode, dailyQuotaDeduction, monthlyQuotaDeduction);
    if (deductQuotaResult.err) {
        wrapper.response(response, false, deductQuotaResult);
    } else {
        wrapper.response(response, true, deductQuotaResult, "Partner quota deducted", successCode.OK);
    }
    return;
}

const getRemainingQuota = async (request, response) => {
    let partnerCode = request.params.partnerCode;
    let remainingQuotaResult = await partnerQuota.getQuotaByPartnerCode(partnerCode);

    if (remainingQuotaResult.err) {
        wrapper.response(response, false, remainingQuotaResult);
    } else {
        wrapper.response(response, true, remainingQuotaResult, "Partner quota(s) retrieved", successCode.OK);
    }
}

const getAllRemainingQuota = async (request, response) => {
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

    let allRemainingQuotaResult = await partnerQuota.getAllQuota(page, limit, offset);

    if (allRemainingQuotaResult.err) {
        wrapper.response(response, false, allRemainingQuotaResult);
    } else {
        wrapper.paginationResponse(response, true, allRemainingQuotaResult, "Partner quota(s) retrieved", successCode.OK);
    }
    return;
}

module.exports = {
    upsertQuota,
    deductQuota,
    getRemainingQuota,
    getAllRemainingQuota
}
