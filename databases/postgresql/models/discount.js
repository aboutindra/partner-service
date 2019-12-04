const { NotFoundError,InternalServerError,ConflictError,BadRequestError,ForbiddenError } = require('../../../utilities/error');
const wrapper = require('../../../utilities/wrapper');
const postgresqlWrapper = require('../../postgresql');
const { ERROR:errorCode } = require('../errorCode');

class Discount {
    constructor(database) {
        this.database = database
    }

    async insertDiscount(code, name, deductionDiscountType = null, deductionDiscountAmount = null, additionDiscountType = null, additionDiscountAmount = null, startDate, endDate) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let insertDiscountQuery = {
            name: 'insert-discount',
            text: `INSERT INTO public.discount_program(
                code, name, deduction_discount_type, deduction_discount_amount, addition_discount_type, addition_discount_amount, is_active, start_date, end_date, created_at, updated_at)
                VALUES ($1, $2, LOWER($3)::cost_type, $4, LOWER($5)::cost_type, $6, $7, $8, $9, $10, $11);`,
            values: [code, name, deductionDiscountType, deductionDiscountAmount, additionDiscountType, additionDiscountAmount, true, startDate, endDate, new Date(), new Date()]
        }

        try {
            let result = await dbClient.query(insertDiscountQuery);
            if (result.rowCount === 0) {
                return wrapper.error(new NotFoundError("Failed add new package"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            if (error.code === errorCode.INVALID_ENUM) {
                return wrapper.error(new BadRequestError("Invalid type value"));
            }
            if (error.code === errorCode.UNIQUE_VIOLATION) {
                return wrapper.error(new ForbiddenError("Code already exist"));
            }
            return wrapper.error(new InternalServerError("Internal server error"));
        }
    }

    async updateDiscount() {
        let dbClient = postgresqlWrapper.getConnection(this.database);
    }

    async softDeleteDiscount(code) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let deleteDiscountQuery = {
            name: 'soft-delete-discount-program',
            text: `UPDATE public.discount_program
                SET is_active = false, updated_at = $2, deactivated_at = $3
                WHERE code = $1`,
            values: [code, new Date(), new Date()]
        }

        try {
            let result = await dbClient.query(deleteDiscountQuery);
            if (result.rowCount === 0) {
                return wrapper.error(new NotFoundError("Discount not found"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            return wrapper.error(new InternalServerError("Internal server error"));
        }
    }

    async getAllDiscount(limit = null, offset = null) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let getAllDiscountQuery = {
            name: 'get-discount-history',
            text: `SELECT code, name, deduction_discount_type AS "deductionDiscountType", deduction_discount_amount AS "deductionDiscountAmount", 
                addition_discount_type AS "additionDiscountType", addition_discount_amount AS "additionDiscountAmount", is_active AS "isActive", start_date AS "startDate", 
                end_date AS "endDate", created_at AS "createdAt", updated_at AS "updatedAt", deactivated_at AS "deactivatedAt"
                FROM public.discount_program
                ORDER BY created_at DESC
                LIMIT $1 OFFSET $2;`,
            values: [limit, offset]
        }

        try {
            let result = await dbClient.query(getAllDiscountQuery);
            if (result.rows.length === 0) {
                return wrapper.error(new NotFoundError("Discount(s) not found"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            return wrapper.error(new InternalServerError("Internal server error"));
        }
    }

    async getDiscountByCode(code) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let getDiscountQuery = {
            name: 'get-discount',
            text: `SELECT code, name, deduction_discount_type AS "deductionDiscountType", deduction_discount_amount AS "deductionDiscountAmount", 
                addition_discount_type AS "additionDiscountType", addition_discount_amount AS "additionDiscountAmount", is_active AS "isActive", start_date AS "startDate", 
                end_date AS "endDate", created_at AS "createdAt", updated_at AS "updatedAt", deactivated_at AS "deactivatedAt"
                FROM public.discount_program
                WHERE code = $1;`,
            values: [code]
        }

        try {
            let result = await dbClient.query(getDiscountQuery);
            if (result.rows.length === 0) {
                return wrapper.error(new NotFoundError("Discount not found"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            return wrapper.error(new InternalServerError("Internal server error"));
        }
    }

    async getActiveDiscount() {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let getActiveDiscountQuery = {
            name: 'get-active-discount-list',
            text: `SELECT code, name, deduction_discount_type AS "deductionDiscountType", deduction_discount_amount AS "deductionDiscountAmount", addition_discount_type AS "additionDiscountType",
                addition_discount_amount AS "additionDiscountAmount"
                FROM public.discount_program
                WHERE start_date <= NOW() AND NOW() <= end_date AND is_active = true
                FETCH FIRST 1 ROWS ONLY`
        }

        try {
            let result = await dbClient.query(getActiveDiscountQuery);
            if (result.rows.length === 0) {
                return wrapper.error(new NotFoundError("Active discount not found"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            return wrapper.error(new InternalServerError("Internal server error"));
        }
    }
}

module.exports = Discount;