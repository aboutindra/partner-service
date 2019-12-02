const wrapper = require('../utilities/wrapper');
const { validationResult } = require('express-validator');
const AcquirerPackage = require('../databases/postgresql/models/acquirerPackage');
const acquirerPackage = new AcquirerPackage(process.env.POSTGRESQL_DATABASE_PARTNER);
const { SUCCESS:successCode } = require('../utilities/httpStatusCode');
const { BadRequestError } = require('../utilities/error');

const insertPackage = async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        let error = wrapper.error(new BadRequestError("Invalid input parameter"));
        error.data = errors.array();
        wrapper.response(response, false, error);
        return;
    }

    let { name, costType } = request.body;
    let amount = Number(request.body.amount);

    let result = await acquirerPackage.insertPackage(name, costType.toLowerCase(), amount);

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Package added", successCode.CREATED);
    }
    return;
}

const updatePackage = async (request, response) => {
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

    let result = await acquirerPackage.updatePackageById(id, name, costType.toLowerCase(), amount);

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Package updated", successCode.OK);
    }
    return;
}

const deletePackage = async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        let error = wrapper.error(new BadRequestError("Invalid input parameter"));
        error.data = errors.array();
        wrapper.response(response, false, error);
        return;
    }

    let id = parseInt(request.params.id);

    let result = await acquirerPackage.softDeletePackageById(id);

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Package deleted", successCode.OK);
    }
    return;
}

const getPackages = async (request, response) => {
    let result;

    if (request.query.id) {
        let id = parseInt(request.query.id);
        if (isNaN(id)) {
            wrapper.response(response, false, wrapper.error(new BadRequestError("Id must be an integer value")));
            return;
        }
        result = await acquirerPackage.getPackageById(id);
    } else {
        result = await acquirerPackage.getAllPackage();
    }

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Packages retrieved", successCode.OK);
    }
    return;
}

module.exports = {
    insertPackage,
    updatePackage,
    deletePackage,
    getPackages
}