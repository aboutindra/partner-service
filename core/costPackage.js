const wrapper = require('../utilities/wrapper');
const { validationResult } = require('express-validator');
const CostPackage = require('../databases/postgresql/models/costPackage');
const costPackage = new CostPackage(process.env.POSTGRESQL_DATABASE_PARTNER);
const { SUCCESS:successCode } = require('../enum/httpStatusCode');
const ResponseMessage = require('../enum/httpResponseMessage');
const { BadRequestError } = require('../utilities/error');

const insertCostPackage = async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        const error = wrapper.error(new BadRequestError(ResponseMessage.INVALID_INPUT_PARAMETER));
        error.data = errors.array();
        wrapper.response(response, false, error);
        return;
    }

    const { name } = request.body;
    const amount = Number(request.body.amount);

    const insertPackageResult = await costPackage.insertPackage(name, amount);

    if (insertPackageResult.err) {
        wrapper.response(response, false, insertPackageResult);
    } else {
        wrapper.response(response, true, insertPackageResult, "Package added", successCode.CREATED);
    }
    return;
}

const updateCostPackage = async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        const error = wrapper.error(new BadRequestError(ResponseMessage.INVALID_INPUT_PARAMETER));
        error.data = errors.array();
        wrapper.response(response, false, error);
        return;
    }

    const id = parseInt(request.params.id);
    const { name } = request.body;
    const amount = Number(request.body.amount);

    const updatePackageResult = await costPackage.updatePackageById(id, name, amount);

    if (updatePackageResult.err) {
        wrapper.response(response, false, updatePackageResult);
    } else {
        wrapper.response(response, true, updatePackageResult, "Package updated", successCode.OK);
    }
    return;
}

const deleteCostPackage = async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        const error = wrapper.error(new BadRequestError(ResponseMessage.INVALID_INPUT_PARAMETER));
        error.data = errors.array();
        wrapper.response(response, false, error);
        return;
    }

    const id = parseInt(request.params.id);

    const deletePackageResult = await costPackage.softDeletePackageById(id);

    if (deletePackageResult.err) {
        wrapper.response(response, false, deletePackageResult);
    } else {
        wrapper.response(response, true, deletePackageResult, "Package deleted", successCode.OK);
    }
    return;
}

const getCostPackages = async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        const error = wrapper.error(new BadRequestError(ResponseMessage.INVALID_INPUT_PARAMETER));
        error.data = errors.array();
        wrapper.response(response, false, error);
        return;
    }

    let getPackagesResult = null;
    const { id, page, limit, offset, search } = request.query;

    if (id) {
        getPackagesResult = await costPackage.getPackageById(parseInt(id));
    } else {
        getPackagesResult = await costPackage.getPackages(page, limit, offset, search);
    }

    if (getPackagesResult.err) {
        wrapper.response(response, false, getPackagesResult);
        return;
    } else {
        wrapper.paginationResponse(response, true, getPackagesResult, "Package(s) retrieved", successCode.OK);
    }
    return;
}

module.exports = {
    insertCostPackage,
    updateCostPackage,
    deleteCostPackage,
    getCostPackages
}
