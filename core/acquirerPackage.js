const wrapper = require('../utilities/wrapper');
const AcquirerPackage = require('../databases/postgresql/models/acquirerPakage');
const acquirerPackage = new AcquirerPackage(process.env.POSTGRESQL_DATABASE_PARTNER);
const { ERROR:erroCode, SUCCESS:successCode } = require('../utilities/httpStatusCode');
const { NotFoundError,InternalServerError,ConflictError,BadRequestError,ForbiddenError } = require('../utilities/error');

const insertPackage = async (request, response) => {
    let { name, costType } = request.body;
    let amount = Number(request.body.amount);

    if(isNaN(amount)) {
        wrapper.response(response, false, wrapper.error(new BadRequestError("Amount must be an integer value")));
        return;
    }
    if (amount < 0) {
        wrapper.response(response, false, wrapper.error(new BadRequestError("Amount must be greater than zero")));
        return;
    }

    let result = await acquirerPackage.insertPackage(name, costType.toLowerCase(), amount);

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Package added", successCode.CREATED);
    }
    return;
}

const updatePackage = async (request, response) => {
    let id = request.params.id;
    let { name, costType } = request.body;
    let amount = Number(request.body.amount);

    if (isNaN(id)) {
        wrapper.response(response, false, wrapper.error(new BadRequestError("Id must be an integer value")));
        return;
    }
    if(isNaN(amount)) {
        wrapper.response(response, false, wrapper.error(new BadRequestError("Amount must be an integer value")));
        return;
    }
    if (amount < 0) {
        wrapper.response(response, false, wrapper.error(new BadRequestError("Amount must be greater than zero")));
        return;
    }

    let result = await acquirerPackage.updatePackageById(id, name, costType.toLowerCase(), amount);

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Package updated", successCode.OK);
    }
    return;
}

const deletePackage = async (request, response) => {
    let id = request.params.id;

    if (isNaN(id)) {
        wrapper.response(response, false, wrapper.error(new BadRequestError("Id must be an integer value")));
        return;
    }

    let result = await acquirerPackage.softDeletePackageById(id);

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Package deleted", successCode.OK);
    }
    return;
}

const getPackages = async (request, response) => {
    let id = parseInt(request.query.id);

    if (isNaN(id)) {
        wrapper.response(response, false, wrapper.error(new BadRequestError("Id must be an integer value")));
        return;
    }

    let result = {};
    if (id) {
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