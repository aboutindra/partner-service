const wrapper = require('../utilities/wrapper');
const { validationResult } = require('express-validator');
const { SUCCESS:successCode } = require('../enum/httpStatusCode');
const { BadRequestError, ForbiddenError } = require('../utilities/error');
const Discount = require('../databases/postgresql/models/discount');
const discount = new Discount(process.env.POSTGRESQL_DATABASE_PARTNER);

const insertDiscount = async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        let error = wrapper.error(new BadRequestError("Invalid input parameter"));
        error.data = errors.array();
        wrapper.response(response, false, error);
        return;
    }

    let { code, name, discountType, amount, startDate, endDate } = request.body;
    code = code.toUpperCase();

    let currentProgram = await discount.getActiveDiscount();
    if (currentProgram.err && currentProgram.err.message !== "Active discount not found") {
        wrapper.response(response, false, currentProgram);
        return;
    } else {
        if (currentProgram.data.length > 0) {
            wrapper.response(response, false, wrapper.error(new ForbiddenError("There is another program currently running")));
            return;
        }
    }

    let params = {code, name, discountType, amount, startDate, endDate};
    let result = await discount.insertDiscount(params);
    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Discount added", successCode.CREATED);
    }
    return;
}

const deleteDiscount = async (request, response) => {
    let code = request.params.code.toUpperCase();

    let result = await discount.softDeleteDiscount(code);
    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Discount deleted", successCode.OK);
    }
}

const getDiscounts = async (request, response) => {
    let result;

    if (request.query.code) {
        let code = request.query.code.toUpperCase();
        result = await discount.getDiscountByCode(code);
    } else {
        let {page, limit, offset} = request.query;
        result = await discount.getAllDiscount(page, limit, offset);
    }

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Discount(s) retrieved", successCode.OK);
    }
    return;
}

const getActiveDiscounts = async (request, response) => {
    let result = await discount.getActiveDiscount();

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
