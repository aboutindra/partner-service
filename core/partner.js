const wrapper = require('../utilities/wrapper');
const { validationResult } = require('express-validator');
const { SUCCESS:successCode } = require('../utilities/httpStatusCode');
const { BadRequestError } = require('../utilities/error');
const Partner = require('../databases/postgresql/models/partner');
const partner = new Partner(process.env.POSTGRESQL_DATABASE_PARTNER);

const insertPartner = async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        let error = wrapper.error(new BadRequestError("Invalid input parameter"));
        error.data = errors.array();
        wrapper.response(response, false, error);
        return;
    }

    let { code, name, issuerCostPackageId, acquirerCostPackageId, segmentId, urlLogo, unit } = request.body;
    code = code.toUpperCase();
    name = name.toLowerCase();

    let result = await partner.insertPartner(code, name, issuerCostPackageId, acquirerCostPackageId, segmentId, urlLogo, unit);

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Partner added", successCode.OK);
    }
    return;
}

const updatePartner = async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        let error = wrapper.error(new BadRequestError("Invalid input parameter"));
        error.data = errors.array();
        wrapper.response(response, false, error);
        return;
    }

    let { name, issuerCostPackageId, acquirerCostPackageId, segmentId, urlLogo, unit } = request.body;
    let code = request.params.code.toUpperCase();
    name = name.toLowerCase();

    let result = await partner.updatePartner(code, name, issuerCostPackageId, acquirerCostPackageId, segmentId, urlLogo, unit);

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Partner updated", successCode.OK);
    }
    return;
}

const deletePartner = async (request, response) => {
    let code = request.params.code.toUpperCase();

    let result = await partner.softDeletePartner(code);
    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Partner deleted", successCode.OK);
    }
}

const getPartners = async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        let error = wrapper.error(new BadRequestError("Invalid input parameter"));
        error.data = errors.array();
        wrapper.response(response, false, error);
        return;
    }

    let result;

    if (request.query.code) {
        let code = request.query.code.toUpperCase();
        result = await partner.getPartnerByCode(code);
    } else {
        let page = null;
        let limit = null;
        let offset = null;
        if (request.query.page && request.query.limit) {
            page = parseInt(request.query.page);
            limit = parseInt(request.query.limit);
            offset = limit * (page - 1);
        }

        result = await partner.getAllPartner(page, limit, offset);
    }

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.paginationResponse(response, true, result, "Partner(s) retrieved", successCode.OK);
    }
    return;
}

const getActivePartners = async (request, response) => {
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

    let result = await partner.getAllActivePartner(page, limit, offset);

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.paginationResponse(response, true, result, "Partner(s) retrieved", successCode.OK);
    }
    return;
}

const getIssuer = async (request, response) => {
    let { partnerCode } = request.params;

    partnerCode = partnerCode.toUpperCase();

    let result = await partner.getIssuer(partnerCode);

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.paginationResponse(response, true, result, "Issuer retrieved", successCode.OK);
    }
}

const getIssuers = async (request, response) => {
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

    let result = await partner.getAllIssuers(page, limit, offset);

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.paginationResponse(response, true, result, "Partner(s) retrieved", successCode.OK);
    }
    return;
}

const getActiveIssuers = async (request, response) => {
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

    let result = await partner.getAllActiveIssuers(page, limit, offset);

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.paginationResponse(response, true, result, "Partner(s) retrieved", successCode.OK);
    }
    return;
}

const getAcquirer = async (request, response) => {
    let { partnerCode } = request.params;

    partnerCode = partnerCode.toUpperCase();

    let result = await partner.getAcquirer(partnerCode);

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.paginationResponse(response, true, result, "Acquirer retrieved", successCode.OK);
    }
}

const getAcquirers = async (request, response) => {
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

    let result = await partner.getAllAcquirers(page, limit, offset);

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.paginationResponse(response, true, result, "Partner(s) retrieved", successCode.OK);
    }
    return;
}

const getActiveAcquirers = async (request, response) => {
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

    let result = await partner.getAllActiveAcquirers(page, limit, offset);

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.paginationResponse(response, true, result, "Partner(s) retrieved", successCode.OK);
    }
    return;
}

module.exports = {
    insertPartner,
    updatePartner,
    deletePartner,
    getPartners,
    getIssuer,
    getAcquirer,
    getActivePartners,
    getIssuers,
    getActiveIssuers,
    getAcquirers,
    getActiveAcquirers
}