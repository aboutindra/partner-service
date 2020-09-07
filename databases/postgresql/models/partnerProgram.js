const { NotFoundError, InternalServerError, ForbiddenError } = require('../../../utilities/error');
const wrapper = require('../../../utilities/wrapper');
const postgresqlWrapper = require('../../postgresql');
const { ERROR:errorCode } = require('../errorCode');
const ResponseMessage = require('../../../enum/httpResponseMessage');
const PartnerProgramResponseMessage = {
    PARTNER_PROGRAM_NOT_FOUND: "Partner program not found"
}

class PartnerProgram {
    constructor(database) {
        this.database = database;
    }

    /* istanbul ignore next */
    async insertProgram(params) {
        const {partnerCode, exchangeRate, minAmountPerTransaction, maxAmountPerTransaction, maxTransactionAmountPerDay,
            maxTransactionAmountPerMonth, startDate, endDate} = params;
        let status = false;
        const timestamp = new Date();
        if (startDate.getTime() <= timestamp.getTime() && timestamp.getTime() < endDate.getTime()) {
            status = true;
        }
        const dbPool = postgresqlWrapper.getConnection(this.database);
        const insertPartnerProgramQuery = {
            name: 'add-new-partner-program',
            text: `INSERT INTO public.partner_program(
                partner_code, exchange_rate, start_date, end_date, minimum_amount_per_transaction, maximum_amount_per_transaction,
                maximum_transaction_amount_per_day, maximum_transaction_amount_per_month, is_active, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);`,
            values: [partnerCode, exchangeRate, startDate, endDate, minAmountPerTransaction, maxAmountPerTransaction, maxTransactionAmountPerDay,
                maxTransactionAmountPerMonth, status, timestamp, timestamp]
        }

        const inserQuotaQuery = {
            name: 'upsert-quota',
            text: `INSERT INTO public.partner_quota(
                partner_code, remaining_deduction_quota_per_day, remaining_deduction_quota_per_month, is_deleted, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (partner_code) DO UPDATE
                SET remaining_deduction_quota_per_day = $2, remaining_deduction_quota_per_month = $3;`,
            values: [partnerCode, maxTransactionAmountPerDay, maxTransactionAmountPerMonth, false, new Date(), new Date()]
        }

        const client = await dbPool.connect();
        try {
            await client.query('BEGIN');
            await client.query(insertPartnerProgramQuery);
            await client.query(inserQuotaQuery);
            const result = await client.query('COMMIT');
            if (result.rowCount === 0) {
                return wrapper.error(new NotFoundError("Failed add new partner program"));
            }
            client.release();
            return wrapper.data(result.rows);
        }
        catch (error) {
            console.error(error);
            await client.query('ROLLBACK');
            client.release();
            if (error.code === errorCode.UNIQUE_VIOLATION) {
                return wrapper.error(new ForbiddenError("Code already exist"));
            }
            if (error.code === errorCode.FOREIGN_KEY_VIOLATION) {
                return wrapper.error(new ForbiddenError("Partner doesn't exist"));
            }
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async softDeleteProgram(id) {
        const dbPool = postgresqlWrapper.getConnection(this.database);
        const deletePartnerProgramQuery = {
            name: 'soft-delete-partner-program',
            text: `UPDATE public.partner_program
                SET is_active = false, updated_at = $2, deactivated_at = $3
                WHERE id = $1`,
            values: [id, new Date(), new Date()]
        }

        try {
            const result = await dbPool.query(deletePartnerProgramQuery);
            if (result.rowCount === 0) {
                return wrapper.error(new NotFoundError(PartnerProgramResponseMessage.PARTNER_PROGRAM_NOT_FOUND));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getAllProgram(page, limit, offset, search) {
        const dbPool = postgresqlWrapper.getConnection(this.database);
        const getAllPartnerProgramQuery = {
            name: 'get-partner-program-list',
            text: `SELECT id, partner_code AS "partnerCode", name AS "partnerName", exchange_rate AS "exchangeRate",
                minimum_amount_per_transaction AS "minimumAmountPerTransaction", maximum_amount_per_transaction as "maximumAmountPerTransaction",
                maximum_transaction_amount_per_day AS "maximumTransactionAmountPerDay", maximum_transaction_amount_per_month AS "maximumTransactionAmountPerMonth",
                is_active AS "isActive", start_date AS "startDate", end_date AS "endDate",
                program.created_at AS "createdAt", program.updated_at AS "updatedAt", program.deactivated_at AS "deactivatedAt"
                FROM public.partner_program AS program
                INNER JOIN public.partner AS partner ON (partner_code = code)
                WHERE partner_code = $3 OR $3 IS NULL OR lower(name) LIKE lower('%' || $3 || '%')
                ORDER BY program.created_at ASC
                LIMIT $1 OFFSET $2;`,
                values: [limit, offset, search]
        }
        const countDataQuery = {
            name: 'count-partner-program-list',
            text: `SELECT COUNT(*)
                FROM public.partner_program
                INNER JOIN public.partner AS partner ON (partner_code = code)
                WHERE partner_code = $1 OR $1 IS NULL OR lower(name) LIKE lower('%' || $1 || '%');`,
            values: [search]
        }

        try {
            const getAllPartnerProgramResult = await dbPool.query(getAllPartnerProgramQuery);
            if (getAllPartnerProgramResult.rows.length === 0) {
                return wrapper.error(new NotFoundError("Partner program(s) not found"));
            }
            const countAllPartnerProgramResult = await dbPool.query(countDataQuery);
            const totalData = parseInt(countAllPartnerProgramResult.rows[0].count);
            let totalPage = Math.ceil(totalData / limit);
            if (limit === null) {
                totalPage = 1;
            }
            const totalDataOnPage = getAllPartnerProgramResult.rows.length;
            const meta = {
                page: page || 1,
                totalData,
                totalPage,
                totalDataOnPage
            }

            return wrapper.paginationData(getAllPartnerProgramResult.rows, meta);
        }
        catch (error) {
            console.error(error);
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getProgramById(id) {
        const dbPool = postgresqlWrapper.getConnection(this.database);
        const getPartnerProgramQuery = {
            name: 'get-partner-program',
            text: `SELECT id, partner_code AS "partnerCode", exchange_rate AS "exchangeRate",
                minimum_amount_per_transaction AS "minimumAmountPerTransaction", maximum_amount_per_transaction as "maximumAmountPerTransaction",
                maximum_transaction_amount_per_day AS "maximumTransactionAmountPerDay", maximum_transaction_amount_per_month AS "maximumTransactionAmountPerMonth",
                is_active AS "isActive", start_date AS "startDate", end_date AS "endDate",
                created_at AS "createdAt", updated_at AS "updatedAt", deactivated_at AS "deactivatedAt"
                FROM public.partner_program
                WHERE id = $1`,
            values: [id]
        }

        try {
            const result = await dbPool.query(getPartnerProgramQuery);
            if (result.rows.length === 0) {
                return wrapper.error(new NotFoundError(PartnerProgramResponseMessage.PARTNER_PROGRAM_NOT_FOUND));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getPartnerProgram(partnerCode, page = null, limit = null, offset = null) {
        const dbPool = postgresqlWrapper.getConnection(this.database);
        const getPartnerProgramQuery = {
            name: 'get-program-of-partner',
            text: `SELECT id, partner_code AS "partnerCode", exchange_rate AS "exchangeRate",
                minimum_amount_per_transaction AS "minimumAmountPerTransaction", maximum_amount_per_transaction as "maximumAmountPerTransaction",
                maximum_transaction_amount_per_day AS "maximumTransactionAmountPerDay", maximum_transaction_amount_per_month AS "maximumTransactionAmountPerMonth",
                is_active AS "isActive", start_date AS "startDate", end_date AS "endDate",
                created_at AS "createdAt", updated_at AS "updatedAt", deactivated_at AS "deactivatedAt"
                FROM public.partner_program
                WHERE partner_code = $1
                ORDER BY created_at DESC
                LIMIT $2 OFFSET $3;`,
            values: [partnerCode, limit, offset]
        }
        const countDataQuery = {
            name: 'count-program-of-partner',
            text: `SELECT COUNT(*)
                FROM public.partner_program
                WHERE partner_code = $1;`,
                values: [partnerCode]
        }
        try {
            const getPartnerProgramResult = await dbPool.query(getPartnerProgramQuery);
            if (getPartnerProgramResult.rows.length === 0) {
                return wrapper.error(new NotFoundError("Partner program(s) not found"));
            }
            const count = await dbPool.query(countDataQuery);
            const totalData = parseInt(count.rows[0].count);
            let totalPage = Math.ceil(totalData / limit);
            if (limit === null) {
                totalPage = 1;
            }
            const totalDataOnPage = getPartnerProgramResult.rows.length;
            const meta = {
                page: page || 1,
                totalData,
                totalPage,
                totalDataOnPage
            }

            return wrapper.paginationData(getPartnerProgramResult.rows, meta);
        }
        catch (error) {
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getActivePartnerProgram(partnerCode, startDate, endDate) {
        const dbPool = postgresqlWrapper.getConnection(this.database);
        const getActiveDiscountQuery = {
            name: 'get-active-program',
            text: `SELECT partner_code AS "partnerCode", exchange_rate AS "exchangeRate", minimum_amount_per_transaction AS "minimumAmountPerTransaction",
                maximum_amount_per_transaction AS "maximumAmountPerTransaction", maximum_transaction_amount_per_day AS "maximumTransactionAmountPerDay",
                maximum_transaction_amount_per_month AS "maximumTransactionAmountPerMonth", start_date AS "startDate", end_date AS "endDate"
                FROM public.partner_program
                WHERE (($2::date <= start_date AND start_date <= $3::date) OR ($2::date <= end_date AND end_date <= $3::date))
                AND (is_active = true OR (is_active = false AND deactivated_at IS NULL)) AND partner_code = $1
                FETCH FIRST 1 ROWS ONLY`,
            values: [partnerCode, startDate, endDate]
        }

        try {
            const result = await dbPool.query(getActiveDiscountQuery);
            if (result.rows.length === 0) {
                return wrapper.error(new NotFoundError("Active partner program not found"));
            }
            return wrapper.data(result.rows[0]);
        }
        catch (error) {
            console.error(error)
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

}

module.exports = PartnerProgram;
