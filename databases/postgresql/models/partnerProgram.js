const logger = require('../../../utilities/logger');
const { NotFoundError,InternalServerError,ConflictError,BadRequestError,ForbiddenError } = require('../../../utilities/error');
const wrapper = require('../../../utilities/wrapper');
const postgresqlWrapper = require('../../postgresql');

class PartnerProgram {
    constructor(database) {
        this.database = database;
    }

    async insertProgram(partnerCode, exchangeRate, minAmountPerTransaction, maxAmountPerTransaction, maxTransactionAmountPerDay, maxTransactionAmountPerMonth, 
        startDate, endDate) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let insertPartnerProgramQuery = {
            name: 'add-new-partner-program',
        text: `INSERT INTO public.partner_program(
            partner_code, exchange_rate, start_date, end_date, minimum_amount_per_transaction, maximum_amount_per_transaction, maximum_transaction_amount_per_day,
            maximum_transaction_amount_per_month, is_active, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);`,
            values: [partnerCode, exchangeRate, startDate, endDate, minAmountPerTransaction, maxAmountPerTransaction, maxTransactionAmountPerDay, maxTransactionAmountPerMonth,
                true, new Date(), new Date()]
        }

        try {
            let result = await dbClient.query(insertPartnerProgramQuery);
            if (result.rowCount === 0) {
                return wrapper.error(new NotFoundError("Failed add new partner program"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            if (error.code === 'ECONNREFUSED') {
                return wrapper.error(new InternalServerError("Internal server error"));
            }
            if (error.code === '23505') {
                return wrapper.error(new ForbiddenError("Code already exist"));
            }
            if (error.code === '23503') {
                return wrapper.error(new ForbiddenError("Partner doesn't exist"));
            }
        }
    }

    async updateProgram() {

    }

    async softDeleteProgram(id) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let deletePartnerProgramQuery = {
            name: 'soft-delete-partner-program',
            text: `UPDATE public.partner_program
                SET is_active = false, updated_at = $2, deactivated_at = $3
                WHERE id = $1`,
            values: [id, new Date(), new Date()]
        }

        try {
            let result = await dbClient.query(deletePartnerProgramQuery);
            if (result.rowCount === 0) {
                return wrapper.error(new NotFoundError("Partner program not found"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            if (error.code === 'ECONNREFUSED') {
                return wrapper.error(new InternalServerError("Internal server error"));
            }
        }
    }

    async getAllProgram() {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let getAllDiscountQuery = {
            name: 'get-partner-program-list',
            text: `SELECT * FROM public.partner_program`
        }

        try {
            let result = await dbClient.query(getAllDiscountQuery);
            if (result.rows.length === 0) {
                return wrapper.error(new NotFoundError("Partner program(s) not found"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            if (error.code === 'ECONNREFUSED') {
                return wrapper.error(new InternalServerError("Internal server error"));
            }
        }
    }

    async getProgramById(id) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let getPartnerProgramQuery = {
            name: 'get-partner-program',
            text: `SELECT * FROM public.partner_program
                WHERE id = $1`,
            values: [id]
        }

        try {
            let result = await dbClient.query(getPartnerProgramQuery);
            if (result.rows.length === 0) {
                return wrapper.error(new NotFoundError("Partner program(s) not found"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            if (error.code === 'ECONNREFUSED') {
                return wrapper.error(new InternalServerError("Internal server error"));
            }
        }
    }

    async getPartnerProgram(partnerCode) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let getPartnerProgramQuery = {
            name: 'get-partner-program-of-partner',
            text: `SELECT * FROM public.partner_program
                WHERE partner_code = $1`,
            values: [partnerCode]
        }

        try {
            let result = await dbClient.query(getPartnerProgramQuery);
            if (result.rows.length === 0) {
                return wrapper.error(new NotFoundError("Partner program(s) not found"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            if (error.code === 'ECONNREFUSED') {
                return wrapper.error(new InternalServerError("Internal server error"));
            }
        }
    }

    async getActivePartnerProgram(partnerCode) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let getActiveDiscountQuery = {
            name: 'get-active-program',
            text: `SELECT partner_code, exchange_rate, minimum_amount_per_transaction, maximum_amount_per_transaction, maximum_transaction_amount_per_day, maximum_transaction_amount_per_month
                FROM public.partner_program
                WHERE start_date <= NOW() AND NOW() <= end_date AND is_active = true AND partner_code = $1
                FETCH FIRST 1 ROWS ONLY`,
            values: [partnerCode]
        }

        try {
            let result = await dbClient.query(getActiveDiscountQuery);
            if (result.rows.length === 0) {
                return wrapper.error(new NotFoundError("Active discount not found"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            if (error.code === 'ECONNREFUSED') {
                return wrapper.error(new InternalServerError("Internal server error"));
            }
        }
    }
}

module.exports = PartnerProgram;
