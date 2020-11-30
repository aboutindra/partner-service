const apm = require('elastic-apm-node');
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
        let status = false;
        const timestamp = new Date();
        if (startDate.getTime() <= timestamp.getTime() && timestamp.getTime() < endDate.getTime()) {
            status = true;
        }
        const dbClient = postgresqlWrapper.getConnection(this.database);
        const insertDiscountQuery = {
            name: 'insert-discount',
            text: `INSERT INTO public.discount_program(
                code, partner_code, name, amount, is_active, start_date, end_date, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
            values: [code, partnerCode, name, amount, status, startDate, endDate, new Date(), new Date()]
        }

        try {
            const insertDiscountResult = await dbClient.query(insertDiscountQuery);
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
            apm.captureError(error);
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async softDeleteDiscount(code) {
        const dbClient = postgresqlWrapper.getConnection(this.database);
        const deleteDiscountQuery = {
            name: 'soft-delete-discount-program',
            text: `UPDATE public.discount_program
                SET is_active = false, updated_at = $2, deactivated_at = $3
                WHERE code = $1`,
            values: [code, new Date(), new Date()]
        }

        try {
            const result = await dbClient.query(deleteDiscountQuery);
            if (result.rowCount === 0) {
                return wrapper.error(new NotFoundError(DiscountResponseMessage.DISCOUNT_NOT_FOUND));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            apm.captureError(error);
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getAllDiscount(page, limit, offset, search) {
        const dbClient = postgresqlWrapper.getConnection(this.database);
        const getAllDiscountQuery = {
            name: 'get-discounts',
            text: `SELECT code, partner_code AS "partnerCode", name, amount, is_active AS "isActive", start_date AS "startDate",
                end_date AS "endDate", created_at AS "createdAt", updated_at AS "updatedAt", deactivated_at AS "deactivatedAt"
                FROM public.discount_program
                WHERE partner_code = $3 OR $3 IS NULL OR code = $3 OR lower(name) LIKE lower('%' || $3 || '%')
                ORDER BY created_at DESC
                LIMIT $1 OFFSET $2;`,
            values: [limit, offset, search]
        }
        const countDataQuery = {
            name: 'count-discounts',
            text: `SELECT COUNT(*)
                FROM public.discount_program
                WHERE partner_code = $1 OR $1 IS NULL OR code = $1 OR lower(name) LIKE lower('%' || $1 || '%');`,
            values: [search]
        }

        try {
            const getAllDiscountResult = await dbClient.query(getAllDiscountQuery);
            if (getAllDiscountResult.rows.length === 0) {
                return wrapper.error(new NotFoundError("Discount(s) not found"));
            }
            const countAllDiscountResult = await dbClient.query(countDataQuery);
            const totalData = parseInt(countAllDiscountResult.rows[0].count);
            let totalPage = Math.ceil(totalData / limit);
            if (limit === null) {
                totalPage = 1;
            }
            const totalDataOnPage = getAllDiscountResult.rows.length;
            const meta = {
                page: page || 1,
                totalData,
                totalPage,
                totalDataOnPage
            }

            return wrapper.paginationData(getAllDiscountResult.rows, meta);
        }
        catch (error) {
            apm.captureError(error);
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getDiscountByCode(code) {
        const dbClient = postgresqlWrapper.getConnection(this.database);
        const getDiscountQuery = {
            name: 'get-discount',
            text: `SELECT code, partner_code AS "partnerCode", name, amount, is_active AS "isActive", start_date AS "startDate",
                end_date AS "endDate", created_at AS "createdAt", updated_at AS "updatedAt", deactivated_at AS "deactivatedAt"
                FROM public.discount_program
                WHERE code = $1;`,
            values: [code]
        }

        try {
            const result = await dbClient.query(getDiscountQuery);
            if (result.rows.length === 0) {
                return wrapper.error(new NotFoundError(DiscountResponseMessage.DISCOUNT_NOT_FOUND));
            }
            return wrapper.data(result.rows[0]);
        }
        catch (error) {
            apm.captureError(error);
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getActiveDiscount(partnerCode) {
        const dbClient = postgresqlWrapper.getConnection(this.database);
        const getActiveDiscountQuery = {
            name: 'get-active-discount-list',
            text: `SELECT code, partner_code AS "partnerCode", name, amount
                FROM public.discount_program
                WHERE start_date <= NOW()::date AND NOW()::date <= end_date AND is_active = true AND partner_code = $1
                FETCH FIRST 1 ROWS ONLY`,
            values: [partnerCode]
        }

        try {
            const result = await dbClient.query(getActiveDiscountQuery);
            if (result.rows.length === 0) {
                return wrapper.error(new NotFoundError("Active discount not found"));
            }
            return wrapper.data(result.rows[0]);
        }
        catch (error) {
            apm.captureError(error);
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getRunningDiscount(partnerCode, startDate, endDate) {
        const dbClient = postgresqlWrapper.getConnection(this.database);
        const getActiveDiscountQuery = {
            name: 'get-active-discount-list',
            text: `SELECT code, partner_code AS "partnerCode", name, amount
                FROM public.discount_program
                WHERE (($2::date <= start_date AND start_date <= $3::date) OR ($2::date <= end_date AND end_date <= $3::date))
                AND (is_active = true OR (is_active = false AND deactivated_at IS NULL)) AND partner_code = $1
                FETCH FIRST 1 ROWS ONLY`,
            values: [partnerCode, startDate, endDate]
        }

        try {
            const result = await dbClient.query(getActiveDiscountQuery);
            if (result.rows.length === 0) {
                return wrapper.error(new NotFoundError("Active discount not found"));
            }
            return wrapper.data(result.rows[0]);
        }
        catch (error) {
            apm.captureError(error);
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

}

module.exports = Discount;
