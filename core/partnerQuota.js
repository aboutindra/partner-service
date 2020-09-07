const wrapper = require('../utilities/wrapper');
const { validationResult } = require('express-validator');
const { SUCCESS:successCode } = require('../enum/httpStatusCode');
const { BadRequestError } = require('../utilities/error');
const PartnerQuota = require('../databases/postgresql/models/partnerQuota');
const partnerQuota = new PartnerQuota(process.env.POSTGRESQL_DATABASE_PARTNER);

const upsertQuota = async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        const error = wrapper.error(new BadRequestError("Invalid input parameter"));
        error.data = errors.array();
        wrapper.response(response, false, error);
        return;
    }

    const { partnerCode, remainingQuotaPerDay, remainingQuotaPerMonth } = request.body;

    const upsertQuotaResult = await partnerQuota.upsertQuota(partnerCode, remainingQuotaPerDay, remainingQuotaPerMonth);
    if (upsertQuotaResult.err) {
        wrapper.response(response, false, upsertQuotaResult);
    } else {
        wrapper.response(response, true, upsertQuotaResult, "Partner quota added", successCode.CREATED);
    }
}

const deductQuota = async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        const error = wrapper.error(new BadRequestError("Invalid input parameter"));
        error.data = errors.array();
        wrapper.response(response, false, error);
        return;
    }

    const partnerCode = request.params.partnerCode;
    const { dailyQuotaDeduction, monthlyQuotaDeduction } = request.body;

    const deductQuotaResult = await partnerQuota.deductQuota(partnerCode, dailyQuotaDeduction, monthlyQuotaDeduction);
    if (deductQuotaResult.err) {
        wrapper.response(response, false, deductQuotaResult);
    } else {
        wrapper.response(response, true, deductQuotaResult, "Partner quota deducted", successCode.OK);
    }
}

const getRemainingQuota = async (request, response) => {
    const partnerCode = request.params.partnerCode;
    const remainingQuotaResult = await partnerQuota.getQuotaByPartnerCode(partnerCode);

    if (remainingQuotaResult.err) {
        wrapper.response(response, false, remainingQuotaResult);
    } else {
        wrapper.response(response, true, remainingQuotaResult, "Partner quota(s) retrieved", successCode.OK);
    }
}

const getAllRemainingQuota = async (request, response) => {
    const { page, limit, offset } = request.query;
    const allRemainingQuotaResult = await partnerQuota.getAllQuota(page, limit, offset);

    if (allRemainingQuotaResult.err) {
        wrapper.response(response, false, allRemainingQuotaResult);
    } else {
        wrapper.paginationResponse(response, true, allRemainingQuotaResult, "Partner quota(s) retrieved", successCode.OK);
    }
}

module.exports = {
    upsertQuota,
    deductQuota,
    getRemainingQuota,
    getAllRemainingQuota
}
