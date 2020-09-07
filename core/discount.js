const wrapper = require('../utilities/wrapper');
const { validationResult } = require('express-validator');
const { SUCCESS:successCode } = require('../enum/httpStatusCode');
const { BadRequestError, ForbiddenError } = require('../utilities/error');
const Discount = require('../databases/postgresql/models/discount');
const discount = new Discount(process.env.POSTGRESQL_DATABASE_PARTNER);

const insertDiscount = async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        const error = wrapper.error(new BadRequestError("Invalid input parameter"));
        error.data = errors.array();
        wrapper.response(response, false, error);
        return;
    }

    request.body.startDate = new Date(request.body.startDate);
    request.body.endDate = new Date(request.body.endDate);

    const currentProgram = await discount.getRunningDiscount(request.body.partnerCode, request.body.startDate, request.body.endDate);
    if (currentProgram.err && currentProgram.err.message !== "Active discount not found") {
        wrapper.response(response, false, currentProgram);
        return;
    } else if (currentProgram.data) {
        wrapper.response(response, false, wrapper.error(new ForbiddenError("There is another program currently running")));
        return;
    }

    const result = await discount.insertDiscount(request.body);
    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Discount added", successCode.CREATED);
    }
    return;
}

const deleteDiscount = async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        const error = wrapper.error(new BadRequestError("Invalid input parameter"));
        error.data = errors.array();
        wrapper.response(response, false, error);
        return;
    }

    const { code } = request.params;

    const result = await discount.softDeleteDiscount(code);
    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Discount deleted", successCode.OK);
    }
}

const getDiscounts = async (request, response) => {
    let result;
    let { code, page, limit, offset, search } = request.query;

    if (code) {
        code = code.toUpperCase();
        result = await discount.getDiscountByCode(code);
    } else {
        result = await discount.getAllDiscount(page, limit, offset, search);
    }

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.paginationResponse(response, true, result, "Discount(s) retrieved", successCode.OK);
    }
    return;
}

const getActiveDiscounts = async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        const error = wrapper.error(new BadRequestError("Invalid input parameter"));
        error.data = errors.array();
        wrapper.response(response, false, error);
        return;
    }

    const { partnerCode } = request.params;
    const result = await discount.getActiveDiscount(partnerCode);

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Active discount retrieved", successCode.OK);
    }
}

module.exports = {
    insertDiscount,
    deleteDiscount,
    getDiscounts,
    getActiveDiscounts
}
