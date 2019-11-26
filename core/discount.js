const wrapper = require('../utilities/wrapper');
const moment = require('moment');
const { ERROR:erroCode, SUCCESS:successCode } = require('../utilities/httpStatusCode');
const { NotFoundError,InternalServerError,ConflictError,BadRequestError,ForbiddenError } = require('../utilities/error');
const Discount = require('../databases/postgresql/models/discount');
const discount = new Discount(process.env.POSTGRESQL_DATABASE_PARTNER);

const insertDiscount = async (request, response) => {
    let { code, name, deductionDiscountType, deductionDiscountAmount, additionDiscountType, additionDiscountAmount, startDate, endDate } = request.body;
    code = code.toUpperCase();
    if (deductionDiscountType !== 'null' || deductionDiscountType !== null) {
        deductionDiscountAmount = Number(deductionDiscountAmount);
        if (isNaN(deductionDiscountAmount)) {
            wrapper.response(response, false, wrapper.error(new BadRequestError("Deduction discount amount must be a number value")));
            return;
        }
    } else {
        deductionDiscountType = null;
        deductionDiscountAmount = null;
    }

    if (additionDiscountType !== 'null' || additionDiscountType !== null) {
        additionDiscountAmount = Number(additionDiscountAmount);
        if (isNaN(additionDiscountAmount)) {
            wrapper.response(response, false, wrapper.error(new BadRequestError("Addition discount amount must be a number value")));
            return;
        }
    } else {
        additionDiscountType = null
        additionDiscountAmount = null;
    }

    startDate = moment(startDate);
    endDate = moment(endDate);

    if (!startDate.isValid() || !endDate.isValid()) {
        wrapper.response(response, false, wrapper.error(new BadRequestError("Invalid date value")));
    } else {
        startDate = startDate.toDate();
    }

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

const softDeleteDiscount = async (request, response) => {
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
    softDeleteDiscount,
    getDiscounts,
    getActiveDiscounts
}