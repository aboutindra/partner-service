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

    let insertPartnerResult = await partner.insertPartner(code, name, issuerCostPackageId, acquirerCostPackageId, segmentId, urlLogo, unit);

    if (insertPartnerResult.err) {
        wrapper.response(response, false, insertPartnerResult);
    } else {
        wrapper.response(response, true, insertPartnerResult, "Partner added", successCode.OK);
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

    let updatePartnerResult = await partner.updatePartner(code, name, issuerCostPackageId, acquirerCostPackageId, segmentId, urlLogo, unit);

    if (updatePartnerResult.err) {
        wrapper.response(response, false, updatePartnerResult);
    } else {
        wrapper.response(response, true, updatePartnerResult, "Partner updated", successCode.OK);
    }
    return;
}

const deletePartner = async (request, response) => {
    let code = request.params.code.toUpperCase();

    let deletePartnerResult = await partner.softDeletePartner(code);
    if (deletePartnerResult.err) {
        wrapper.response(response, false, deletePartnerResult);
    } else {
        wrapper.response(response, true, deletePartnerResult, "Partner deleted", successCode.OK);
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

    let getPartnerResult;

    if (request.query.code) {
        let code = request.query.code.toUpperCase();
        getPartnerResult = await partner.getPartnerByCode(code);
    } else {
        let {page, limit, offset} = request.query;
        getPartnerResult = await partner.getAllPartner(page, limit, offset);
    }

    if (getPartnerResult.err) {
        wrapper.response(response, false, getPartnerResult);
    } else {
        wrapper.paginationResponse(response, true, getPartnerResult, "Partner(s) retrieved", successCode.OK);
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

    let {page, limit, offset} = request.query;
    let getActivePartnerResult = await partner.getAllActivePartner(page, limit, offset);

    if (getActivePartnerResult.err) {
        wrapper.response(response, false, getActivePartnerResult);
    } else {
        wrapper.paginationResponse(response, true, getActivePartnerResult, "Partner(s) retrieved", successCode.OK);
    }
    return;
}

const getIssuer = async (request, response) => {
    let { partnerCode } = request.params;

    partnerCode = partnerCode.toUpperCase();

    let getIssuerResult = await partner.getIssuer(partnerCode);

    if (getIssuerResult.err) {
        wrapper.response(response, false, getIssuerResult);
    } else {
        wrapper.paginationResponse(response, true, getIssuerResult, "Issuer retrieved", successCode.OK);
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

    let {page, limit, offset} = request.query;
    let getIssuersResult = await partner.getAllIssuers(page, limit, offset);

    if (getIssuersResult.err) {
        wrapper.response(response, false, getIssuersResult);
    } else {
        wrapper.paginationResponse(response, true, getIssuersResult, "Partner(s) retrieved", successCode.OK);
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

    let {page, limit, offset} = request.query;
    let getActiveIssuersResult = await partner.getAllActiveIssuers(page, limit, offset);

    if (getActiveIssuersResult.err) {
        wrapper.response(response, false, getActiveIssuersResult);
    } else {
        wrapper.paginationResponse(response, true, getActiveIssuersResult, "Partner(s) retrieved", successCode.OK);
    }
    return;
}

const getAcquirer = async (request, response) => {
    let { partnerCode } = request.params;

    partnerCode = partnerCode.toUpperCase();

    let getAcquirerResult = await partner.getAcquirer(partnerCode);

    if (getAcquirerResult.err) {
        wrapper.response(response, false, getAcquirerResult);
    } else {
        wrapper.paginationResponse(response, true, getAcquirerResult, "Acquirer retrieved", successCode.OK);
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

    let {page, limit, offset} = request.query;
    let getAcquirersResult = await partner.getAllAcquirers(page, limit, offset);

    if (getAcquirersResult.err) {
        wrapper.response(response, false, getAcquirersResult);
    } else {
        wrapper.paginationResponse(response, true, getAcquirersResult, "Partner(s) retrieved", successCode.OK);
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

    let {page, limit, offset} = request.query;
    let getActiveAcquirersResult = await partner.getAllActiveAcquirers(page, limit, offset);

    if (getActiveAcquirersResult.err) {
        wrapper.response(response, false, getActiveAcquirersResult);
    } else {
        wrapper.paginationResponse(response, true, getActiveAcquirersResult, "Partner(s) retrieved", successCode.OK);
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
