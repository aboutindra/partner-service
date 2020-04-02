const wrapper = require('../utilities/wrapper');
const { validationResult } = require('express-validator');
const IssuerPackage = require('../databases/postgresql/models/issuerPackage');
const issuerPackage = new IssuerPackage(process.env.POSTGRESQL_DATABASE_PARTNER);
const { SUCCESS:successCode } = require('../enum/httpStatusCode');
const ResponseMessage = require('../enum/httpResponseMessage');
const { BadRequestError } = require('../utilities/error');

const insertIssuerPackage = async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        let error = wrapper.error(new BadRequestError(ResponseMessage.INVALID_INPUT_PARAMETER));
        error.data = errors.array();
        wrapper.response(response, false, error);
        return;
    }

    let { name, costType } = request.body;
    let amount = Number(request.body.amount);

    let insertIssuerPackageResult = await issuerPackage.insertPackage(name, costType.toLowerCase(), amount);

    if (insertIssuerPackageResult.err) {
        wrapper.response(response, false, insertIssuerPackageResult);
    } else {
        wrapper.response(response, true, insertIssuerPackageResult, "Package added", successCode.CREATED);
    }
    return;
}

const updateIssuerPackage = async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        let error = wrapper.error(new BadRequestError(ResponseMessage.INVALID_INPUT_PARAMETER));
        error.data = errors.array();
        wrapper.response(response, false, error);
        return;
    }

    let id = parseInt(request.params.id);
    let { name, costType } = request.body;
    let amount = Number(request.body.amount);

    let updateIssuerPackageResult = await issuerPackage.updatePackageById(id, name, costType.toLowerCase(), amount);

    if (updateIssuerPackageResult.err) {
        wrapper.response(response, false, updateIssuerPackageResult);
    } else {
        wrapper.response(response, true, updateIssuerPackageResult, "Package updated", successCode.OK);
    }
    return;
}

const deleteIssuerPackage = async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        let error = wrapper.error(new BadRequestError(ResponseMessage.INVALID_INPUT_PARAMETER));
        error.data = errors.array();
        wrapper.response(response, false, error);
        return;
    }

    let id = parseInt(request.params.id);

    let deleteIssuerPackageResult = await issuerPackage.softDeletePackageById(id);

    if (deleteIssuerPackageResult.err) {
        wrapper.response(response, false, deleteIssuerPackageResult);
    } else {
        wrapper.response(response, true, deleteIssuerPackageResult, "Package deleted", successCode.OK);
    }
    return;
}

const getIssuerPackages = async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        let error = wrapper.error(new BadRequestError(ResponseMessage.INVALID_INPUT_PARAMETER));
        error.data = errors.array();
        wrapper.response(response, false, error);
        return;
    }

    let getIssuerPackagesResult = null;

    if (request.query.id) {
        let id = parseInt(request.query.id);
        getIssuerPackagesResult = await issuerPackage.getPackageById(id);
    } else {
        let {page, limit, offset} = request.query;
        getIssuerPackagesResult = await issuerPackage.getAllIssuerPackage(page, limit, offset);
    }

    if (getIssuerPackagesResult.err) {
        wrapper.response(response, false, getIssuerPackagesResult);
        return;
    } else {
        wrapper.paginationResponse(response, true, getIssuerPackagesResult, "Package(s) retrieved", successCode.OK);
    }
    return;
}

module.exports = {
    insertIssuerPackage,
    updateIssuerPackage,
    deleteIssuerPackage,
    getIssuerPackages
}
