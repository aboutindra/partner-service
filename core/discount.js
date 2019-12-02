const wrapper = require('../utilities/wrapper');
const { validationResult } = require('express-validator');
const { SUCCESS:successCode } = require('../utilities/httpStatusCode');
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

    let { code, name, deductionDiscountType, deductionDiscountAmount, additionDiscountType, additionDiscountAmount, startDate, endDate } = request.body;
    code = code.toUpperCase();

    let currentProgram = await discount.getActiveDiscount();
    if (currentProgram.data.length > 0) {
        wrapper.response(response, false, wrapper.error(new ForbiddenError("There is another program currently running")));
        return;
    }

    let result = await discount.insertDiscount(code, name, deductionDiscountType, deductionDiscountAmount, additionDiscountType, additionDiscountAmount, startDate, endDate);
    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Discount added", successCode.CREATED);
    }
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
        result = await discount.getAllDiscount();
    }

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Discount(s) retrieved", successCode.OK);
    }
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