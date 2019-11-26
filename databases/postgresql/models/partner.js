const logger = require('../../../utilities/logger');
const { NotFoundError,InternalServerError,ConflictError,BadRequestError,ForbiddenError } = require('../../../utilities/error');
const wrapper = require('../../../utilities/wrapper');
const postgresqlWrapper = require('../../postgresql');

class Partner {
    constructor(database) {
        this.database = database;
    }

    async insertPartner(code, name, isAcquirer, isIssuer, issuerCostPackageId, acquirerCostPackageId, segmentId, logo, unit) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let insertPartnerQuery = {
            name: "add-new-partner",
            text: `INSERT INTO public.partner(
                code, name, is_acquirer, is_issuer, issuer_cost_package_id, acquirer_cost_package_id, is_deleted, segment_id, logo, created_at, updated_at, unit)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);`,
            values: [code, name, isAcquirer, isIssuer, issuerCostPackageId, acquirerCostPackageId, false, segmentId, logo, new Date(), new Date(), unit]
        }

        try {
            let result = await dbClient.query(insertPartnerQuery);
            if (result.rowCount === 0) {
                return wrapper.error(new NotFoundError("Failed add new partner"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            if (error.code === 'ECONNREFUSED') {
                return wrapper.error(new InternalServerError("Internal server error"));
            }
            if (error.code === '22P02') {
                return wrapper.error(new BadRequestError("Invalid type value"));
            }
            if (error.code === '23505') {
                return wrapper.error(new ForbiddenError("Code already exist"));
            }
            if (error.code === '23502') {
                return wrapper.error(new BadRequestError("Segment id can not be null"));
            }
        }

    }

    async updatePartner(code, name, isAcquirer, isIssuer, issuerCostPackageId, acquirerCostPackageId, segmentId, logo, unit) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let updatePartnerQuery = {
            name: "update-partner",
            text: `UPDATE public.partner
                SET name = $2, is_acquirer = $3, is_issuer = $4, issuer_cost_package_id = $5, acquirer_cost_package_id = $6, segment_id = $7, logo = $8, updated_at = $9, unit = $10
                WHERE code = $1;`,
            values: [code, name, isAcquirer, isIssuer, issuerCostPackageId, acquirerCostPackageId, segmentId, logo, new Date(), unit]
        }

        try {
            let result = await dbClient.query(updatePartnerQuery);
            if (result.rowCount === 0) {
                return wrapper.error(new NotFoundError("Partner not found"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            console.log(error);
            if (error.code === 'ECONNREFUSED') {
                return wrapper.error(new InternalServerError("Internal server error"));
            }
        }
    }

    async softDeletePartner(code) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let deleteDiscountQuery = {
            name: 'soft-delete-partner-program-by-partner-code',
            text: `UPDATE public.partner_program
                SET is_active = false, updated_at = $2, deleted_at = $3
                WHERE partner_code = UPPER($1)`,
            values: [code, new Date(), new Date()]
        }

        try {
            let result = await dbClient.query(deleteDiscountQuery);
            if (result.rowCount === 0) {
                return wrapper.error(new NotFoundError("Partner not found"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            console.log(error);
            if (error.code === 'ECONNREFUSED') {
                return wrapper.error(new InternalServerError("Internal server error"));
            }
        }
    }

    async getAllPartner() {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let getAllPartnerQuery = {
            name: "get-partner-list",
            text: `SELECT * FROM public.partner`
        }

        try {
            let result = await dbClient.query(getAllPartnerQuery);
            if (result.rows.length === 0) {
                return wrapper.error(new NotFoundError("Partner(s) not found"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            if (error.code === 'ECONNREFUSED') {
                return wrapper.error(new InternalServerError("Internal server error"));
            }
        }
    }

    async getPartnerByCode(code) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let getAllPartnerQuery = {
            name: "get-partner",
            text: `SELECT * FROM public.partner
                WHERE code = $1`,
            values: [code]
        }

        try {
            let result = await dbClient.query(getAllPartnerQuery);
            if (result.rows.length === 0) {
                return wrapper.error(new NotFoundError("Partner(s) not found"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            if (error.code === 'ECONNREFUSED') {
                return wrapper.error(new InternalServerError("Internal server error"));
            }
        }
    }

    async getAllActivePartner() {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let getAllActivePartnerQuery = {
            name: "get-active-partner-list",
            text: `SELECT * FROM public.partner
            WHERE is_deleted = false`
        }

        try {
            let result = await dbClient.query(getAllActivePartnerQuery);
            if (result.rows.length === 0) {
                return wrapper.error(new NotFoundError("Partner(s) not found"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            if (error.code === 'ECONNREFUSED') {
                return wrapper.error(new InternalServerError("Internal server error"));
            }
        }
    }
    
    async getAllIssuers() {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let getAllIssuersQuery = {
            name: "get-issuer-list",
            text: `SELECT *
            FROM public.partner
            WHERE is_issuer = true AND is_deleted = false`
        }

        try {
            let result = await dbClient.query(getAllIssuersQuery);
            if (result.rows.length === 0) {
                return wrapper.error(new NotFoundError("Partner(s) not found"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            if (error.code === 'ECONNREFUSED') {
                return wrapper.error(new InternalServerError("Internal server error"));
            }
        }
    }

    async getAllActiveIssuers() {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let getAllActiveIssuersQuery = {
            name: "get-active-issuer-list",
        text: `SELECT code, name, is_issuer, logo, unit
            FROM public.partner as partners
            WHERE EXISTS (SELECT 1 FROM public.partner_program WHERE partners.code = partner_code
            AND start_date <= NOW() AND NOW() <= end_date AND is_active = true)
            AND partners.is_issuer = true AND partners.is_deleted = false`
        }

        try {
            let result = await dbClient.query(getAllActiveIssuersQuery);
            if (result.rows.length === 0) {
                return wrapper.error(new NotFoundError("Partner(s) not found"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            if (error.code === 'ECONNREFUSED') {
                return wrapper.error(new InternalServerError("Internal server error"));
            }
        }
    }

    async getAllAcquirers() {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let getAllAcquirersQuery = {
            name: "get-acquirer-list",
            text: `SELECT * FROM public.partner
            WHERE is_acquirer = true AND is_deleted = false`
        }

        try {
            let result = await dbClient.query(getAllAcquirersQuery);
            if (result.rows.length === 0) {
                return wrapper.error(new NotFoundError("Partner(s) not found"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            if (error.code === 'ECONNREFUSED') {
                return wrapper.error(new InternalServerError("Internal server error"));
            }
        }
    }

    async getAllActiveAcquirers() {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let getAllActiveAcquirersQuery = {
            name: "get-active-acquirer-list",
            text: `SELECT code, name, is_acquirer, logo, unit
                FROM public.partner as partners
                WHERE EXISTS (SELECT 1 FROM public.partner_program WHERE partners.code = partner_code
                AND start_date <= NOW() AND NOW() <= end_date AND is_active = true)
                AND partners.is_acquirer = true AND partners.is_deleted = false`
        }

        try {
            let result = await dbClient.query(getAllActiveAcquirersQuery);
            if (result.rows.length === 0) {
                return wrapper.error(new NotFoundError("Partner(s) not found"));
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

module.exports = Partner;