const wrapper = require('../utilities/wrapper');
const { validationResult } = require('express-validator');
const { SUCCESS:successCode } = require('../enum/httpStatusCode');
const ResponseMessage = require('../enum/httpResponseMessage');
const { BadRequestError } = require('../utilities/error');
const Partner = require('../databases/postgresql/models/partner');
const partner = new Partner(process.env.POSTGRESQL_DATABASE_PARTNER);
const PartnerResponseMessage = {
    PARTNER_RETRIVIED: "Partner(s) retrieved",
    PARTNER_COUNTS_RETRIVIED: "Partner counts retrieved",
    PARTNER_IMAGES_RETRIVIED: "Partner images retrieved"
}

const insertPartner = async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        let error = wrapper.error(new BadRequestError(ResponseMessage.INVALID_INPUT_PARAMETER));
        error.data = errors.array();
        wrapper.response(response, false, error);
        return;
    }

    let insertPartnerResult = await partner.insertPartner(request.body);

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
        let error = wrapper.error(new BadRequestError(ResponseMessage.INVALID_INPUT_PARAMETER));
        error.data = errors.array();
        wrapper.response(response, false, error);
        return;
    }

    let params = {
        code: request.params.code,
        ...request.body,
    }

    let updatePartnerResult = await partner.updatePartner(params);

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
    let getPartnerResult;

    let { code, page, limit, offset, search } = request.query;

    if (code) {
        getPartnerResult = await partner.getPartnerByCode(code);
    } else {
        getPartnerResult = await partner.getAllPartner(page, limit, offset, search);
    }

    if (getPartnerResult.err) {
        wrapper.response(response, false, getPartnerResult);
    } else {
        wrapper.paginationResponse(response, true, getPartnerResult, PartnerResponseMessage.PARTNER_RETRIVIED, successCode.OK);
    }
    return;
}

const getActivePartners = async (request, response) => {
    let {page, limit, offset} = request.query;
    let getActivePartnerResult = await partner.getAllActivePartner(page, limit, offset);

    if (getActivePartnerResult.err) {
        wrapper.response(response, false, getActivePartnerResult);
    } else {
        wrapper.paginationResponse(response, true, getActivePartnerResult, PartnerResponseMessage.PARTNER_RETRIVIED, successCode.OK);
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
        wrapper.response(response, true, getIssuerResult, "Issuer retrieved", successCode.OK);
    }
}

const getIssuers = async (request, response) => {
    let {page, limit, offset} = request.query;
    let getIssuersResult = await partner.getAllIssuers(page, limit, offset);

    if (getIssuersResult.err) {
        wrapper.response(response, false, getIssuersResult);
    } else {
        wrapper.paginationResponse(response, true, getIssuersResult, PartnerResponseMessage.PARTNER_RETRIVIED, successCode.OK);
    }
    return;
}

const getActiveIssuers = async (request, response) => {
    let {page, limit, offset} = request.query;
    let getActiveIssuersResult = await partner.getAllActiveIssuers(page, limit, offset);

    if (getActiveIssuersResult.err) {
        wrapper.response(response, false, getActiveIssuersResult);
    } else {
        wrapper.paginationResponse(response, true, getActiveIssuersResult, PartnerResponseMessage.PARTNER_RETRIVIED, successCode.OK);
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
        wrapper.response(response, true, getAcquirerResult, "Acquirer retrieved", successCode.OK);
    }
}

const getAcquirers = async (request, response) => {
    let {page, limit, offset} = request.query;
    let getAcquirersResult = await partner.getAllAcquirers(page, limit, offset);

    if (getAcquirersResult.err) {
        wrapper.response(response, false, getAcquirersResult);
    } else {
        wrapper.paginationResponse(response, true, getAcquirersResult, PartnerResponseMessage.PARTNER_RETRIVIED, successCode.OK);
    }
    return;
}

const getActiveAcquirers = async (request, response) => {
    let {page, limit, offset} = request.query;
    let getActiveAcquirersResult = await partner.getAllActiveAcquirers(page, limit, offset);

    if (getActiveAcquirersResult.err) {
        wrapper.response(response, false, getActiveAcquirersResult);
    } else {
        wrapper.paginationResponse(response, true, getActiveAcquirersResult, PartnerResponseMessage.PARTNER_RETRIVIED, successCode.OK);
    }
    return;
}

const getPartnerCounts = async (request, response) => {
    let partnerCountResult = await partner.getCounts();

    if (partnerCountResult.err) {
        wrapper.response(response, false, partnerCountResult);
    } else {
        wrapper.paginationResponse(response, true, partnerCountResult, PartnerResponseMessage.PARTNER_COUNTS_RETRIVIED, successCode.OK);
    }
    return;
}

const getPartnerImages = async (request, response) => {
    let {page, limit, offset, search} = request.query;
    let partnerImagesResult = await partner.getImages(page, limit, offset, search);

    if (partnerImagesResult.err) {
        wrapper.response(response, false, partnerImagesResult);
    } else {
        wrapper.paginationResponse(response, true, partnerImagesResult, PartnerResponseMessage.PARTNER_IMAGES_RETRIVIED, successCode.OK);
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
    getActiveAcquirers,
    getPartnerCounts,
    getPartnerImages
}
