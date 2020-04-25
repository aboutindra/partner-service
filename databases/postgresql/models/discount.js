const { NotFoundError,InternalServerError,ConflictError,BadRequestError,ForbiddenError } = require('../../../utilities/error');
const wrapper = require('../../../utilities/wrapper');
const postgresqlWrapper = require('../../postgresql');
const { ERROR:errorCode } = require('../errorCode');
const ResponseMessage = require('../../../enum/httpResponseMessage');
const DiscountResponseMessage = {
    DISCOUNT_NOT_FOUND: "Discount not found"
}

class Discount {
    constructor(database) {
        this.database = database
    }

    async insertDiscount({code, partnerCode, name, amount, startDate, endDate}) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let insertDiscountQuery = {
            name: 'insert-discount',
            text: `INSERT INTO public.discount_program(
                code, partner_code, name, amount, is_active, start_date, end_date, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
            values: [code, partnerCode, name, amount, true, startDate, endDate, new Date(), new Date()]
        }

        try {
            let insertDiscountResult = await dbClient.query(insertDiscountQuery);
            if (insertDiscountResult.rowCount === 0) {
                return wrapper.error(new NotFoundError("Failed add new package"));
            }
            return wrapper.data(insertDiscountResult.rows);
        }
        catch (error) {
            if (error.code === errorCode.INVALID_ENUM) {
                return wrapper.error(new ForbiddenError("Invalid type value"));
            }
            if (error.code === errorCode.UNIQUE_VIOLATION) {
                return wrapper.error(new ForbiddenError("Code already exist"));
            }
            if (error.code === errorCode.FOREIGN_KEY_VIOLATION) {
                return wrapper.error(new ForbiddenError("Partner doesn't exist"));
            }
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
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
                return wrapper.error(new NotFoundError(DiscountResponseMessage.DISCOUNT_NOT_FOUND));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getAllDiscount(page, limit, offset) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let getAllDiscountQuery = {
            name: 'get-discounts',
            text: `SELECT code, partner_code AS "partnerCode", name, amount, is_active AS "isActive", start_date AS "startDate",
                end_date AS "endDate", created_at AS "createdAt", updated_at AS "updatedAt", deactivated_at AS "deactivatedAt"
                FROM public.discount_program
                ORDER BY created_at DESC
                LIMIT $1 OFFSET $2;`,
            values: [limit, offset]
        }
        let countDataQuery = {
            name: 'count-discounts',
            text: `SELECT COUNT(*)
                FROM public.discount_program`
        }

        try {
            let getAllDiscountResult = await dbClient.query(getAllDiscountQuery);
            if (getAllDiscountResult.rows.length === 0) {
                return wrapper.error(new NotFoundError("Discount(s) not found"));
            }
            let countAllDiscountResult = await dbClient.query(countDataQuery);
            let totalData = parseInt(countAllDiscountResult.rows[0].count);
            let totalPage = Math.ceil(totalData / limit);
            if (limit === null) {
                totalPage = 1;
            }
            let totalDataOnPage = getAllDiscountResult.rows.length;
            let meta = {
                page: page || 1,
                totalData,
                totalPage,
                totalDataOnPage
            }

            return wrapper.paginationData(getAllDiscountResult.rows, meta);
        }
        catch (error) {
            console.error(error)
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getDiscountByCode(code) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let getDiscountQuery = {
            name: 'get-discount',
            text: `SELECT code, partner_code AS "partnerCode", name, amount, is_active AS "isActive", start_date AS "startDate",
                end_date AS "endDate", created_at AS "createdAt", updated_at AS "updatedAt", deactivated_at AS "deactivatedAt"
                FROM public.discount_program
                WHERE code = $1;`,
            values: [code]
        }

        try {
            let result = await dbClient.query(getDiscountQuery);
            if (result.rows.length === 0) {
                return wrapper.error(new NotFoundError(DiscountResponseMessage.DISCOUNT_NOT_FOUND));
            }
            return wrapper.data(result.rows[0]);
        }
        catch (error) {
            console.error(error)
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getActiveDiscount(partnerCode) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let getActiveDiscountQuery = {
            name: 'get-active-discount-list',
            text: `SELECT code, partner_code AS "partnerCode", name, amount
                FROM public.discount_program
                WHERE start_date <= NOW()::date AND NOW()::date <= end_date AND is_active = true AND partner_code = $1
                FETCH FIRST 1 ROWS ONLY`,
            values: [partnerCode]
        }

        try {
            let result = await dbClient.query(getActiveDiscountQuery);
            if (result.rows.length === 0) {
                return wrapper.error(new NotFoundError("Active discount not found"));
            }
            return wrapper.data(result.rows[0]);
        }
        catch (error) {
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    /* istanbul ignore next */
    async updateDiscountStatus() {
        let dbPool = postgresqlWrapper.getConnection(this.database);
        let updateDiscountQuery = {
            name: 'update-discount-status',
            text: `UPDATE public.discount_program
                SET is_active = false, deactivated_at = NOW()
                WHERE (NOW()::date < start_date OR end_date < NOW()::date) AND is_active = true;`
        }
        try {
            let result = await dbPool.query(updateDiscountQuery);
            if (result.rowCount === 0) {
                return wrapper.error(new NotFoundError(DiscountResponseMessage.DISCOUNT_NOT_FOUND));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }
}

module.exports = Discount;
