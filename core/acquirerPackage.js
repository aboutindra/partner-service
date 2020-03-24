const wrapper = require('../utilities/wrapper');
const { validationResult } = require('express-validator');
const AcquirerPackage = require('../databases/postgresql/models/acquirerPackage');
const acquirerPackage = new AcquirerPackage(process.env.POSTGRESQL_DATABASE_PARTNER);
const { SUCCESS:successCode } = require('../utilities/httpStatusCode');
const { BadRequestError } = require('../utilities/error');

const insertAcquirerPackage = async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        let error = wrapper.error(new BadRequestError("Invalid input parameter"));
        error.data = errors.array();
        wrapper.response(response, false, error);
        return;
    }

    let { name, costType } = request.body;
    let amount = Number(request.body.amount);

    let insertAcquirerPackageResult = await acquirerPackage.insertPackage(name, costType.toLowerCase(), amount);

    if (insertAcquirerPackageResult.err) {
        wrapper.response(response, false, insertAcquirerPackageResult);
    } else {
        wrapper.response(response, true, insertAcquirerPackageResult, "Package added", successCode.CREATED);
    }
    return;
}

const updateAcquirerPackage = async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        let error = wrapper.error(new BadRequestError("Invalid input parameter"));
        error.data = errors.array();
        wrapper.response(response, false, error);
        return;
    }

    let id = parseInt(request.params.id);
    let { name, costType } = request.body;
    let amount = Number(request.body.amount);

    let updateAcquirerPackageResult = await acquirerPackage.updatePackageById(id, name, costType.toLowerCase(), amount);

    if (updateAcquirerPackageResult.err) {
        wrapper.response(response, false, updateAcquirerPackageResult);
    } else {
        wrapper.response(response, true, updateAcquirerPackageResult, "Package updated", successCode.OK);
    }
    return;
}

const deleteAcquirerPackage = async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        let error = wrapper.error(new BadRequestError("Invalid input parameter"));
        error.data = errors.array();
        wrapper.response(response, false, error);
        return;
    }

    let id = parseInt(request.params.id);

    let deleteAcquirerPackageResult = await acquirerPackage.softDeletePackageById(id);

    if (deleteAcquirerPackageResult.err) {
        wrapper.response(response, false, deleteAcquirerPackageResult);
    } else {
        wrapper.response(response, true, deleteAcquirerPackageResult, "Package deleted", successCode.OK);
    }
    return;
}

const getAcquirerPackages = async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        let error = wrapper.error(new BadRequestError("Invalid input parameter"));
        error.data = errors.array();
        wrapper.response(response, false, error);
        return;
    }

    let getAcquirerPackagesResult;

    if (request.query.id) {
        let id = parseInt(request.query.id);
        getAcquirerPackagesResult = await acquirerPackage.getPackageById(id);
    } else {
        let {page, limit, offset} = request.query;
        getAcquirerPackagesResult = await acquirerPackage.getAllAcquirerPackage(page, limit, offset);
    }

    if (getAcquirerPackagesResult.err) {
        wrapper.response(response, false, getAcquirerPackagesResult);
    } else {
        wrapper.paginationResponse(response, true, getAcquirerPackagesResult, "Package(s) retrieved", successCode.OK);
    }
    return;
}

module.exports = {
    insertAcquirerPackage,
    updateAcquirerPackage,
    deleteAcquirerPackage,
    getAcquirerPackages
}
