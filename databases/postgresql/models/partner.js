const { NotFoundError, InternalServerError, BadRequestError, ForbiddenError } = require('../../../utilities/error');
const wrapper = require('../../../utilities/wrapper');
const postgresqlWrapper = require('../../postgresql');
const { ERROR:errorCode } = require('../errorCode');
const ResponseMessage = require('../../../enum/httpResponseMessage');
const PartnerResponseMessage = {
    PARTNER_NOT_FOUND: "Partner(s) not found"
}

class Partner {
    constructor(database) {
        this.database = database;
    }

    async insertPartner(code, name, issuerCostPackageId, acquirerCostPackageId, segmentId, urlLogo, unit) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let insertPartnerQuery = {
            name: "add-new-partner",
            text: `INSERT INTO public.partner(
                code, segment_id, issuer_cost_package_id, acquirer_cost_package_id, name, url_logo, unit, is_deleted, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
            values: [code, segmentId, issuerCostPackageId, acquirerCostPackageId, name, urlLogo, unit, false, new Date(), new Date()]
        }

        try {
            let insertQuotaResult = await dbClient.query(insertPartnerQuery);
            if (insertQuotaResult.rowCount === 0) {
                return wrapper.error(new NotFoundError("Failed add new partner"));
            }
            return wrapper.data(insertQuotaResult.rows);
        }
        catch (error) {
            if (error.code === errorCode.UNIQUE_VIOLATION) {
                return wrapper.error(new ForbiddenError("Code already exist"));
            }
            if (error.code === errorCode.FOREIGN_KEY_VIOLATION) {
                return wrapper.error(new ForbiddenError("Id not exist"));
            }
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }

    }

    async updatePartner(code, name, issuerCostPackageId, acquirerCostPackageId, segmentId, url_logo, unit) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let updatePartnerQuery = {
            name: "update-partner",
            text: `UPDATE public.partner
                SET name = $2, issuer_cost_package_id = $3, acquirer_cost_package_id = $4, segment_id = $5, url_logo = $6, updated_at = $7, unit = $8
                WHERE code = $1;`,
            values: [code, name, issuerCostPackageId, acquirerCostPackageId, segmentId, url_logo, new Date(), unit]
        }

        try {
            let updatePartnerResult = await dbClient.query(updatePartnerQuery);
            if (updatePartnerResult.rowCount === 0) {
                return wrapper.error(new NotFoundError("Partner not found"));
            }
            return wrapper.data(updatePartnerResult.rows);
        }
        catch (error) {
            if (error.code === errorCode.FOREIGN_KEY_VIOLATION) {
                return wrapper.error(new ForbiddenError("Id not exist"));
            }
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async softDeletePartner(code) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let deleteDiscountQuery = {
            name: 'soft-delete-partner-program-by-partner-code',
            text: `UPDATE public.partner_program
                SET is_active = false, updated_at = $2, deleted_at = $3
                WHERE partner_code = $1`,
            values: [code, new Date(), new Date()]
        }

        try {
            let deletePartnerResult = await dbClient.query(deleteDiscountQuery);
            if (deletePartnerResult.rowCount === 0) {
                return wrapper.error(new NotFoundError("Partner not found"));
            }
            return wrapper.data(deletePartnerResult.rows);
        }
        catch (error) {
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getAllPartner(page, limit, offset) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let getAllPartnerQuery = {
            name: "get-partner-list",
            text: `SELECT code, segment_id AS "segmentId", issuer_cost_package_id AS "issuerCostPackageId", acquirer_cost_package_id AS "acquirerCostPacakgeId",
                name, url_logo AS "urlLogo", unit,
                CASE WHEN issuer_cost_package_id IS NOT NULL AND acquirer_cost_package_id IS NOT NULL THEN 'Both'
                    WHEN issuer_cost_package_id IS NOT NULL THEN 'Issuer'
                    WHEN acquirer_cost_package_id IS NOT NULL THEN 'Acquirer'
                    ELSE 'Not defined'
                END AS "partnerType",
                is_deleted AS "isDeleted", created_at AS "createdAt", updated_at AS "updatedAt", deleted_at AS "deletedAt"
                FROM public.partner
                ORDER BY name
                LIMIT $1 OFFSET $2;`,
                values: [limit, offset]
        }
        let countDataQuery = {
            name: 'count-partner-list',
            text: `SELECT COUNT(*)
                FROM public.partner;`
        }

        try {
            let getAllPartnersResult = await dbClient.query(getAllPartnerQuery);
            if (getAllPartnersResult.rows.length === 0) {
                return wrapper.error(new NotFoundError(PartnerResponseMessage.PARTNER_NOT_FOUND));
            }
            let countAllPartnersResult = await dbClient.query(countDataQuery);
            let totalData = parseInt(countAllPartnersResult.rows[0].count);
            let totalPage = Math.ceil(totalData / limit);
            if (limit === null) {
                totalPage = 1;
            }
            let totalDataOnPage = getAllPartnersResult.rows.length;
            let meta = {
                page: page || 1,
                totalData,
                totalPage,
                totalDataOnPage
            }

            return wrapper.paginationData(getAllPartnersResult.rows, meta);
        }
        catch (error) {
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getPartnerByCode(code) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let getPartnerQuery = {
            name: "get-partner",
            text: `SELECT  code, segment_id AS "segmentId", issuer_cost_package_id AS "issuerCostPackageId", acquirer_cost_package_id AS "acquirerCostPacakgeId",
                name, url_logo AS "urlLogo", unit,
                CASE WHEN issuer_cost_package_id IS NOT NULL AND acquirer_cost_package_id IS NOT NULL THEN 'Both'
                    WHEN issuer_cost_package_id IS NOT NULL THEN 'Issuer'
                    WHEN acquirer_cost_package_id IS NOT NULL THEN 'Acquirer'
                    ELSE 'Not defined'
                END AS "partnerType",
                is_deleted AS "isDeleted", created_at AS "createdAt", updated_at AS "updatedAt", deleted_at AS "deletedAt"
                FROM public.partner
                WHERE code = $1;`,
            values: [code]
        }

        try {
            let getPartnerByCodeResult = await dbClient.query(getPartnerQuery);
            if (getPartnerByCodeResult.rows.length === 0) {
                return wrapper.error(new NotFoundError(PartnerResponseMessage.PARTNER_NOT_FOUND));
            }
            return wrapper.data(getPartnerByCodeResult.rows);
        }
        catch (error) {
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getAllActivePartner(page, limit, offset) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let getAllActivePartnerQuery = {
            name: "get-active-partner-list",
            text: `SELECT  code, segment_id AS "segmentId", issuer_cost_package_id AS "issuerCostPackageId", acquirer_cost_package_id AS "acquirerCostPacakgeId",
                name, url_logo AS "urlLogo", unit,
                is_deleted AS "isDeleted", created_at AS "createdAt", updated_at AS "updatedAt", deleted_at AS "deletedAt"
                FROM public.partner
                WHERE is_deleted = false
                ORDER BY name
                LIMIT $1 OFFSET $2;`,
                values: [limit, offset]
        }
        let countDataQuery = {
            name: 'count-active-partner',
            text: `SELECT COUNT(*)
                FROM public.partner
                WHERE is_deleted = false;`
        }
        try {
            let getAllActivePartnerResult = await dbClient.query(getAllActivePartnerQuery);
            if (getAllActivePartnerResult.rows.length === 0) {
                return wrapper.error(new NotFoundError(PartnerResponseMessage.PARTNER_NOT_FOUND));
            }
            let countAllActivePartnerResult = await dbClient.query(countDataQuery);
            let totalData = parseInt(countAllActivePartnerResult.rows[0].count);
            let totalPage = Math.ceil(totalData / limit);
            if (limit === null) {
                totalPage = 1;
            }
            let totalDataOnPage = getAllActivePartnerResult.rows.length;
            let meta = {
                page: page || 1,
                totalData,
                totalPage,
                totalDataOnPage
            }

            return wrapper.paginationData(getAllActivePartnerResult.rows, meta);
        }
        catch (error) {
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getAllIssuers(page, limit, offset) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let getAllIssuersQuery = {
            name: "get-issuer-list",
            text: `SELECT  code, segment_id AS "segmentId", issuer_cost_package_id AS "issuerCostPackageId", acquirer_cost_package_id AS "acquirerCostPacakgeId",
                name, url_logo AS "urlLogo", unit,
                is_deleted AS "isDeleted", created_at AS "createdAt", updated_at AS "updatedAt", deleted_at AS "deletedAt"
                FROM public.partner
                WHERE issuer_cost_package_id IS NOT NULL
                ORDER BY name
                LIMIT $1 OFFSET $2;`,
                values: [limit, offset]
        }
        let countDataQuery = {
            name: 'count-issuer-list',
            text: `SELECT COUNT(*)
                FROM public.partner
                WHERE issuer_cost_package_id IS NOT NULL;`
        }
        try {
            let getAllIssuersResult = await dbClient.query(getAllIssuersQuery);
            if (getAllIssuersResult.rows.length === 0) {
                return wrapper.error(new NotFoundError(PartnerResponseMessage.PARTNER_NOT_FOUND));
            }
            let countAllIssuersResult = await dbClient.query(countDataQuery);
            let totalData = parseInt(countAllIssuersResult.rows[0].count);
            let totalPage = Math.ceil(totalData / limit);
            if (limit === null) {
                totalPage = 1;
            }
            let totalDataOnPage = getAllIssuersResult.rows.length;
            let meta = {
                page: page || 1,
                totalData,
                totalPage,
                totalDataOnPage
            }

            return wrapper.paginationData(getAllIssuersResult.rows, meta);
        }
        catch (error) {
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getAllActiveIssuers(page, limit, offset) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let getAllActiveIssuersQuery = {
            name: "get-active-issuer-list",
            text: `SELECT code, name, url_logo AS logo, unit
                FROM public.partner as partners
                WHERE EXISTS (SELECT 1 FROM public.partner_program WHERE partners.code = partner_code
                AND start_date <= NOW() AND NOW() <= end_date AND is_active = true)
                AND partners.issuer_cost_package_id IS NOT NULL AND partners.is_deleted = false
                ORDER BY name
                LIMIT $1 OFFSET $2;`,
                values: [limit, offset]
        }
        let countActiveIssuersQuery = {
            name: 'count-active-issuer-list',
            text: `SELECT COUNT(*)
                FROM public.partner as partners
                WHERE EXISTS (SELECT 1 FROM public.partner_program WHERE partners.code = partner_code
                AND start_date <= NOW() AND NOW() <= end_date AND is_active = true)
                AND partners.issuer_cost_package_id IS NOT NULL AND partners.is_deleted = false`
        }
        try {
            let getAllActiveIssuersResult = await dbClient.query(getAllActiveIssuersQuery);
            if (getAllActiveIssuersResult.rows.length === 0) {
                return wrapper.error(new NotFoundError(PartnerResponseMessage.PARTNER_NOT_FOUND));
            }
            let countAllActiveIssuersResult = await dbClient.query(countActiveIssuersQuery);
            let totalData = parseInt(countAllActiveIssuersResult.rows[0].count);
            let totalPage = Math.ceil(totalData / limit);
            if (limit === null) {
                totalPage = 1;
            }
            let totalDataOnPage = getAllActiveIssuersResult.rows.length;
            let meta = {
                page: page || 1,
                totalData,
                totalPage,
                totalDataOnPage
            }

            return wrapper.paginationData(getAllActiveIssuersResult.rows, meta);
        }
        catch (error) {
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getIssuer(partnerCode) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let getIssuerQuery = {
            name: "get-issuer",
            text: `SELECT  code, cost_type AS "costType", amount AS "costAmount", exchange_rate AS "exchangeRate",
                minimum_amount_per_transaction AS "minimumAmountPerTransaction",
                maximum_amount_per_transaction AS "maximumAmountPerTransaction",
                remaining_deduction_quota_per_day AS "remainingDeductionQuotaPerDay",
                remaining_deduction_quota_per_month AS "remainingDeductionQuotaPerMonth"
                FROM public.partner
                INNER JOIN public.issuer_cost_package AS package ON (id = issuer_cost_package_id)
                INNER JOIN public.partner_quota AS quota ON (code = quota.partner_code)
                INNER JOIN public.partner_program AS programs ON (code = programs.partner_code)
                WHERE code = $1 AND package.is_deleted = false AND programs.is_active = true
                AND programs.start_date <= NOW() AND programs.end_date > NOW();`,
            values: [partnerCode]
        }
        try {
            let getIssuerResult = await dbClient.query(getIssuerQuery);
            if (getIssuerResult.rows.length === 0) {
                return wrapper.error(new NotFoundError("Issuer not found"));
            }
            return wrapper.data(getIssuerResult.rows);
        }
        catch (error) {
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getAllAcquirers(page, limit, offset) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let getAllAcquirersQuery = {
            name: "get-acquirer-list",
            text: `SELECT  code, segment_id AS "segmentId", issuer_cost_package_id AS "issuerCostPackageId", acquirer_cost_package_id AS "acquirerCostPacakgeId",
                name, url_logo AS "urlLogo", unit,
                is_deleted AS "isDeleted", created_at AS "createdAt", updated_at AS "updatedAt", deleted_at AS "deletedAt"
                FROM public.partner
                WHERE acquirer_cost_package_id IS NOT NULL AND is_deleted = false
                ORDER BY name
                LIMIT $1 OFFSET $2;`,
                values: [limit, offset]
        }
        let countDataQuery = {
            name: 'count-acquirer-list',
            text: `SELECT COUNT(*)
                FROM public.partner
                WHERE acquirer_cost_package_id IS NOT NULL;`
        }
        try {
            let getAllAcquirersResult = await dbClient.query(getAllAcquirersQuery);
            if (getAllAcquirersResult.rows.length === 0) {
                return wrapper.error(new NotFoundError(PartnerResponseMessage.PARTNER_NOT_FOUND));
            }
            let countAllAcquirersResult = await dbClient.query(countDataQuery);
            let totalData = parseInt(countAllAcquirersResult.rows[0].count);
            let totalPage = Math.ceil(totalData / limit);
            if (limit === null) {
                totalPage = 1;
            }
            let totalDataOnPage = getAllAcquirersResult.rows.length;
            let meta = {
                page: page || 1,
                totalData,
                totalPage,
                totalDataOnPage
            }

            return wrapper.paginationData(getAllAcquirersResult.rows, meta);
        }
        catch (error) {
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getAllActiveAcquirers(page, limit, offset) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let getAllActiveAcquirersQuery = {
            name: "get-active-acquirer-list",
            text: `SELECT code, name, url_logo AS logo, unit
                FROM public.partner as partners
                WHERE EXISTS (SELECT 1 FROM public.partner_program WHERE partners.code = partner_code
                AND start_date <= NOW() AND NOW() <= end_date AND is_active = true)
                AND partners.acquirer_cost_package_id IS NOT NULL AND partners.is_deleted = false
                ORDER BY name
                LIMIT $1 OFFSET $2;`,
                values: [limit, offset]
        }
        let countActiveAcquirersQuery = {
            name: 'count-active-acquirer-list',
            text: `SELECT COUNT(*)
                FROM public.partner as partners
                WHERE EXISTS (SELECT 1 FROM public.partner_program WHERE partners.code = partner_code
                AND start_date <= NOW() AND NOW() <= end_date AND is_active = true)
                AND partners.acquirer_cost_package_id IS NOT NULL AND partners.is_deleted = false`
        }
        try {
            let getAllActiveAcquirersResult = await dbClient.query(getAllActiveAcquirersQuery);
            if (getAllActiveAcquirersResult.rows.length === 0) {
                return wrapper.error(new NotFoundError(PartnerResponseMessage.PARTNER_NOT_FOUND));
            }
            let count = await dbClient.query(countActiveAcquirersQuery);
            let totalData = parseInt(count.rows[0].count);
            let totalPage = Math.ceil(totalData / limit);
            if (limit === null) {
                totalPage = 1;
            }
            let totalDataOnPage = getAllActiveAcquirersResult.rows.length;
            let meta = {
                page: page || 1,
                totalData,
                totalPage,
                totalDataOnPage
            }

            return wrapper.paginationData(getAllActiveAcquirersResult.rows, meta);
        }
        catch (error) {
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getAcquirer(partnerCode) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let getAcquirerQuery = {
            name: "get-acquirer",
            text: `SELECT  code, cost_type AS "costType", amount AS "costAmount", exchange_rate AS "exchangeRate"
                FROM public.partner
                INNER JOIN public.acquirer_cost_package AS package ON (id = acquirer_cost_package_id)
                INNER JOIN public.partner_program AS programs ON (code = programs.partner_code)
                WHERE code = $1 AND package.is_deleted = false AND programs.is_active = true
                AND programs.start_date <= NOW() AND programs.end_date > NOW();`,
            values: [partnerCode]
        }
        try {
            let getAcquireResult = await dbClient.query(getAcquirerQuery);
            if (getAcquireResult.rows.length === 0) {
                return wrapper.error(new NotFoundError("Acquirer not found"));
            }
            return wrapper.data(getAcquireResult.rows);
        }
        catch (error) {
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

}

module.exports = Partner;
