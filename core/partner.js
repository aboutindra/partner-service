const wrapper = require('../utilities/wrapper');
const { ERROR:erroCode, SUCCESS:successCode } = require('../utilities/httpStatusCode');
const { NotFoundError,InternalServerError,ConflictError,BadRequestError,ForbiddenError } = require('../utilities/error');
const Partner = require('../databases/postgresql/models/partner');
const partner = new Partner(process.env.POSTGRESQL_DATABASE_PARTNER);

const insertPartner = async (request, response) => {
    let { code, name, isAcquirer, isIssuer, issuerCostPackageId, acquirerCostPackageId, segmentId, logo, unit } = request.body;
    code = code.toUpperCase();
    name = name.toLowerCase();

    if (issuerCostPackageId) {
        isIssuer = true;
    }

    if (acquirerCostPackageId) {
        isAcquirer = true;
    }

    let result = await partner.insertPartner(code, name, isAcquirer, isIssuer, issuerCostPackageId, acquirerCostPackageId, segmentId, logo, unit);

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Partner added", successCode.OK);
    }
}

const updatePartner = async (request, response) => {
    let { name, isAcquirer, isIssuer, issuerCostPackageId, acquirerCostPackageId, segmentId, logo, unit } = request.body;
    let code = request.params.code.toUpperCase();
    name = name.toLowerCase();

    if (issuerCostPackageId) {
        isIssuer = true;
    }

    if (acquirerCostPackageId) {
        isAcquirer = true;
    }

    let result = await partner.updatePartner(code, name, isAcquirer, isIssuer, issuerCostPackageId, acquirerCostPackageId, segmentId, logo, unit);

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Partner updated", successCode.OK);
    }
}

const deletePartner = async (request, response) => {

}

const getPartners = async (request, response) => {
    let result;

    if (request.query.code) {
        let code = request.query.code.toUpperCase();
        result = await partner.getPartnerByCode(code);
    } else {
        result = await partner.getAllPartner();
    }

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Partner(s) retrieved", successCode.OK);
    }
}

const getActivePartners = async (request, response) => {
    let result = await partner.getAllActivePartner();

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Partner(s) retrieved", successCode.OK);
    }
}

const getIssuers = async (request, response) => {
    let result = await partner.getAllIssuers();

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Partner(s) retrieved", successCode.OK);
    }
}

const getActiveIssuers = async (request, response) => {
    let result = await partner.getAllActiveIssuers();

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Partner(s) retrieved", successCode.OK);
    }
}

const getAcquirers = async (request, response) => {
    let result = await partner.getAllAcquirers();

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Partner(s) retrieved", successCode.OK);
    }
}

const getActiveAcquirers = async (request, response) => {
    let result = await partner.getAllActiveAcquirers();

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Partner(s) retrieved", successCode.OK);
    }
}

module.exports = {
    insertPartner,
    updatePartner,
    deletePartner,
    getPartners,
    getActivePartners,
    getIssuers,
    getActiveIssuers,
    getAcquirers,
    getActiveAcquirers
}