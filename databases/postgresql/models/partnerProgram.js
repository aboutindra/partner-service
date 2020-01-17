const { NotFoundError, InternalServerError, ForbiddenError } = require('../../../utilities/error');
const wrapper = require('../../../utilities/wrapper');
const postgresqlWrapper = require('../../postgresql');
const { ERROR:errorCode } = require('../errorCode');

class PartnerProgram {
    constructor(database) {
        this.database = database;
    }

    async insertProgram(partnerCode, exchangeRate, minAmountPerTransaction, maxAmountPerTransaction, maxTransactionAmountPerDay, maxTransactionAmountPerMonth, 
        startDate, endDate) {
        let status = false;
        let timestamp = new Date();
        if (startDate.getTime() <= timestamp.getTime() && timestamp.getTime() < endDate.getTime()) {
            status = true;
        }
        let dbPool = postgresqlWrapper.getConnection(this.database);
        let insertPartnerProgramQuery = {
            name: 'add-new-partner-program',
            text: `INSERT INTO public.partner_program(
                partner_code, exchange_rate, start_date, end_date, minimum_amount_per_transaction, maximum_amount_per_transaction, maximum_transaction_amount_per_day,
                maximum_transaction_amount_per_month, is_active, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);`,
            values: [partnerCode, exchangeRate, startDate, endDate, minAmountPerTransaction, maxAmountPerTransaction, maxTransactionAmountPerDay, maxTransactionAmountPerMonth,
                status, timestamp, timestamp]
        }

        let inserQuotaQuery = {
            name: 'upsert-quota',
            text: `INSERT INTO public.partner_quota(
                partner_code, remaining_deduction_quota_per_day, remaining_deduction_quota_per_month)
                VALUES ($1, $2, $3)
                ON CONFLICT (partner_code) DO UPDATE
                SET remaining_deduction_quota_per_day = $2, remaining_deduction_quota_per_month = $3;`,
            values: [partnerCode, maxTransactionAmountPerDay, maxTransactionAmountPerMonth]
        }

        let client = await dbPool.connect();
        try {
            await client.query('BEGIN');
            await client.query(insertPartnerProgramQuery);
            await client.query(inserQuotaQuery);
            let result = await client.query('COMMIT');
            if (result.rowCount === 0) {
                return wrapper.error(new NotFoundError("Failed add new partner program"));
            }
            client.release();
            return wrapper.data(result.rows);
        }
        catch (error) {
            await client.query('ROLLBACK');
            client.release();
            if (error.code === errorCode.UNIQUE_VIOLATION) {
                return wrapper.error(new ForbiddenError("Code already exist"));
            }
            if (error.code === errorCode.FOREIGN_KEY_VIOLATION) {
                return wrapper.error(new ForbiddenError("Partner doesn't exist"));
            }
            return wrapper.error(new InternalServerError("Internal server error"));
        }
    }

    async softDeleteProgram(id) {
        let dbPool = postgresqlWrapper.getConnection(this.database);
        let deletePartnerProgramQuery = {
            name: 'soft-delete-partner-program',
            text: `UPDATE public.partner_program
                SET is_active = false, updated_at = $2, deactivated_at = $3
                WHERE id = $1`,
            values: [id, new Date(), new Date()]
        }

        try {
            let result = await dbPool.query(deletePartnerProgramQuery);
            if (result.rowCount === 0) {
                return wrapper.error(new NotFoundError("Partner program not found"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            return wrapper.error(new InternalServerError("Internal server error"));
        }
    }

    async getAllProgram(page, limit = null, offset = null) {
        let dbPool = postgresqlWrapper.getConnection(this.database);
        let getAllDiscountQuery = {
            name: 'get-partner-program-list',
            text: `SELECT id, partner_code AS "partnerCode", exchange_rate AS "exchangeRate", minimum_amount_per_transaction AS "minimumAmountPerTransaction", 
                maximum_amount_per_transaction as "maximumAmountPerTransaction", maximum_transaction_amount_per_day AS "maximumTransactionAmountPerDay",
                maximum_transaction_amount_per_month AS "maximumTransactionAmountPerMonth", is_active AS "isActive", start_date AS "startDate", end_date AS "endDate",
                created_at AS "createdAt", updated_at AS "updatedAt", deactivated_at AS "deactivatedAt"
                FROM public.partner_program
                ORDER BY created_at DESC
                LIMIT $1 OFFSET $2;`,
                values: [limit, offset]
        }
        let countDataQuery = {
            name: 'count-partner-program-list',
            text: `SELECT COUNT(*)
                FROM public.partner_program;`
        }
        try {
            let result = await dbPool.query(getAllDiscountQuery);
            if (result.rows.length === 0) {
                return wrapper.error(new NotFoundError("Partner program(s) not found"));
            }
            let count = await dbPool.query(countDataQuery);
            let totalData = parseInt(count.rows[0].count);
            let totalPage = Math.ceil(totalData / limit);
            if (totalPage === Infinity) {
                totalPage = 1;
            }
            let totalDataOnPage = result.rows.length;
            let meta = {
                page: page || 1,
                totalData,
                totalPage,
                totalDataOnPage
            }

            return wrapper.paginationData(result.rows, meta);
        }
        catch (error) {
            return wrapper.error(new InternalServerError("Internal server error"));
        }
    }

    async getProgramById(id) {
        let dbPool = postgresqlWrapper.getConnection(this.database);
        let getPartnerProgramQuery = {
            name: 'get-partner-program',
            text: `SELECT id, partner_code AS "partnerCode", exchange_rate AS "exchangeRate", minimum_amount_per_transaction AS "minimumAmountPerTransaction", 
                maximum_amount_per_transaction as "maximumAmountPerTransaction", maximum_transaction_amount_per_day AS "maximumTransactionAmountPerDay",
                maximum_transaction_amount_per_month AS "maximumTransactionAmountPerMonth", is_active AS "isActive", start_date AS "startDate", end_date AS "endDate",
                created_at AS "createdAt", updated_at AS "updatedAt", deactivated_at AS "deactivatedAt"
                FROM public.partner_program
                WHERE id = $1`,
            values: [id]
        }

        try {
            let result = await dbPool.query(getPartnerProgramQuery);
            if (result.rows.length === 0) {
                return wrapper.error(new NotFoundError("Partner program not found"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            return wrapper.error(new InternalServerError("Internal server error"));
        }
    }

    async getPartnerProgram(partnerCode, page = null, limit = null, offset = null) {
        let dbPool = postgresqlWrapper.getConnection(this.database);
        let getPartnerProgramQuery = {
            name: 'get-program-of-partner',
            text: `SELECT id, partner_code AS "partnerCode", exchange_rate AS "exchangeRate", minimum_amount_per_transaction AS "minimumAmountPerTransaction", 
                maximum_amount_per_transaction as "maximumAmountPerTransaction", maximum_transaction_amount_per_day AS "maximumTransactionAmountPerDay",
                maximum_transaction_amount_per_month AS "maximumTransactionAmountPerMonth", is_active AS "isActive", start_date AS "startDate", end_date AS "endDate",
                created_at AS "createdAt", updated_at AS "updatedAt", deactivated_at AS "deactivatedAt"
                FROM public.partner_program
                WHERE partner_code = $1
                ORDER BY created_at DESC
                LIMIT $2 OFFSET $3;`,
            values: [partnerCode, limit, offset]
        }
        let countDataQuery = {
            name: 'count-program-of-partner',
            text: `SELECT COUNT(*)
                FROM public.partner_program
                WHERE partner_code = $1;`,
                values: [partnerCode]
        }
        try {
            let result = await dbPool.query(getPartnerProgramQuery);
            if (result.rows.length === 0) {
                return wrapper.error(new NotFoundError("Partner program(s) not found"));
            }
            let count = await dbPool.query(countDataQuery);
            let totalData = parseInt(count.rows[0].count);
            let totalPage = Math.ceil(totalData / limit);
            if (totalPage === Infinity) {
                totalPage = 1;
            }
            let totalDataOnPage = result.rows.length;
            let meta = {
                page: page || 1,
                totalData,
                totalPage,
                totalDataOnPage
            }

            return wrapper.paginationData(result.rows, meta);
        }
        catch (error) {
            return wrapper.error(new InternalServerError("Internal server error"));
        }
    }

    async getActivePartnerProgram(partnerCode) {
        let dbPool = postgresqlWrapper.getConnection(this.database);
        let getActiveDiscountQuery = {
            name: 'get-active-program',
            text: `SELECT partner_code, exchange_rate, minimum_amount_per_transaction, maximum_amount_per_transaction, maximum_transaction_amount_per_day, maximum_transaction_amount_per_month
                FROM public.partner_program
                WHERE start_date <= NOW() AND NOW() <= end_date AND is_active = true AND partner_code = $1
                FETCH FIRST 1 ROWS ONLY`,
            values: [partnerCode]
        }

        try {
            let result = await dbPool.query(getActiveDiscountQuery);
            if (result.rows.length === 0) {
                return wrapper.error(new NotFoundError("Active partner program not found"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            return wrapper.error(new InternalServerError("Internal server error"));
        }
    }

    /* istanbul ignore next */
    async updatePartnerProgramStatus() {
        let dbPool = postgresqlWrapper.getConnection(this.database);
        let deactivateProgram = {
            name: 'deactivate-partner-program',
            text: `UPDATE public.partner_program
                SET is_active=false, deactivated_at=NOW()
                WHERE end_date < NOW() AND is_active=true;`
        }
        let activateProgram = {
            name: 'activate-partner-program',
            text: `UPDATE public.partner_program
                SET is_active=true
                WHERE start_date <= NOW() AND NOW() <= end_date AND is_active=false AND deactivated_at IS NULL;`
        }

        let client = await dbPool.connect();
        try {
            await client.query('BEGIN');
            await client.query(deactivateProgram);
            await client.query(activateProgram);
            let result = await client.query('COMMIT');
            if (result.rowCount === 0) {
                return wrapper.error(new NotFoundError("Partner program not found"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            console.log(error);
            return wrapper.error(new InternalServerError("Internal server error"));
        }
    }
}

module.exports = PartnerProgram;
