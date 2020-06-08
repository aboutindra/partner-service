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

    async insertPartner({ code, name, costPackageId, isAcquirer, isIssuer, segmentId, costBearerType, urlLogo, unit }) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let insertPartnerQuery = {
            name: "add-new-partner",
            text: `INSERT INTO public.partner(
                code, segment_id, cost_package_id, name, is_acquirer, is_issuer, cost_bearer_type, url_logo, unit, is_deleted, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7::cost_bearer_type, $8, $9, $10, $11, $12);`,
            values: [code, segmentId, costPackageId, name, isAcquirer, isIssuer, costBearerType, urlLogo, unit, false, new Date(), new Date()]
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

    async updatePartner({ code, name, costPackageId, isAcquirer, isIssuer, segmentId, costBearerType, urlLogo, unit }) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let updatePartnerQuery = {
            name: "update-partner",
            text: `UPDATE public.partner
                SET segment_id = $2, cost_package_id = $3, name = $4, is_acquirer = $5, is_issuer = $6, cost_bearer_type = $7::cost_bearer_type,
                url_logo = $8, unit = $9, updated_at = $10
                WHERE code = $1;`,
            values: [code, segmentId, costPackageId, name, isAcquirer, isIssuer, costBearerType, urlLogo, unit, new Date()]
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
            name: 'soft-delete-partner-by-partner-code',
            text: `UPDATE public.partner
                SET is_deleted = true, updated_at = $2, deleted_at = $3
                WHERE code = $1`,
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

    async getAllPartner(page, limit, offset, search) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let getAllPartnerQuery = {
            name: "get-partner-list",
            text: `SELECT code, segment_id AS "segmentId", cost_package_id AS "costPackageId", name, cost_bearer_type AS "costBearerType",
                url_logo AS "urlLogo", unit,
                CASE WHEN is_acquirer IS true AND is_issuer IS true THEN 'Both'
                    WHEN is_acquirer IS true THEN 'Acquirer'
                    WHEN is_issuer IS true THEN 'Issuer'
                    ELSE 'Not defined'
                END AS "partnerType",
                is_deleted AS "isDeleted", created_at AS "createdAt", updated_at AS "updatedAt", deleted_at AS "deletedAt"
                FROM public.partner
                WHERE code = $3 OR $3 IS NULL OR lower(name) LIKE lower('%' || $3 || '%')
                ORDER BY created_at
                LIMIT $1 OFFSET $2;`,
                values: [limit, offset, search]
        }
        let countDataQuery = {
            name: 'count-partner-list',
            text: `SELECT COUNT(*)
                FROM public.partner
                WHERE code = $1 OR $1 IS NULL OR lower(name) LIKE lower('%' || $1 || '%');`,
            values: [search]
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
            console.error(error);
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getPartnerByCode(code) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let getPartnerQuery = {
            name: "get-partner",
            text: `SELECT code, segment_id AS "segmentId", cost_package_id AS "costPackageId", name, cost_bearer_type AS "costBearerType",
                url_logo AS "urlLogo", unit,
                CASE WHEN is_acquirer IS true AND is_issuer IS true THEN 'Both'
                    WHEN is_acquirer IS true THEN 'Acquirer'
                    WHEN is_issuer IS true THEN 'Issuer'
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
            return wrapper.data(getPartnerByCodeResult.rows[0]);
        }
        catch (error) {
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getAllActivePartner(page, limit, offset) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let getAllActivePartnerQuery = {
            name: "get-active-partner-list",
            text: `SELECT  code, is_acquirer AS "isAcquirer", is_issuer AS "isIssuer",
                CASE WHEN (SELECT true FROM public.partner_program WHERE partner_code = partner.code
                AND start_date <= NOW()::date AND NOW()::date <= end_date AND is_active = true) IS true THEN true ELSE false END AS "isProgramActive",
                name, url_logo AS "urlLogo", unit
                FROM public.partner AS partner
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
            text: `SELECT code, segment_id AS "segmentId", cost_package_id AS "costPackageId", name, cost_bearer_type AS "costBearerType",
                url_logo AS "urlLogo", unit, is_deleted AS "isDeleted", created_at AS "createdAt", updated_at AS "updatedAt", deleted_at AS "deletedAt"
                FROM public.partner
                WHERE is_issuer IS true
                ORDER BY name
                LIMIT $1 OFFSET $2;`,
                values: [limit, offset]
        }
        let countDataQuery = {
            name: 'count-issuer-list',
            text: `SELECT COUNT(*)
                FROM public.partner
                WHERE is_issuer IS true;`
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
            text: `SELECT code, name, url_logo AS "urlLogo", unit
                FROM public.partner as partners
                WHERE EXISTS (SELECT 1 FROM public.partner_program WHERE partners.code = partner_code
                AND start_date <= NOW()::date AND NOW()::date <= end_date AND is_active = true)
                AND partners.is_issuer IS true AND partners.is_deleted = false
                ORDER BY name
                LIMIT $1 OFFSET $2;`,
                values: [limit, offset]
        }
        let countActiveIssuersQuery = {
            name: 'count-active-issuer-list',
            text: `SELECT COUNT(*)
                FROM public.partner as partners
                WHERE EXISTS (SELECT 1 FROM public.partner_program WHERE partners.code = partner_code
                AND start_date <= NOW()::date AND NOW()::date <= end_date AND is_active = true)
                AND partners.is_issuer IS true AND partners.is_deleted = false`
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
            text: `SELECT partner.code, partner.name, partner.cost_bearer_type AS "costBearerType", programs.exchange_rate AS "exchangeRate",
                CASE WHEN discount.amount IS NOT NULL THEN CEIL(package.amount::NUMERIC * (100 - discount.amount) / 100) ELSE package.amount END AS "costAmount",
                programs.minimum_amount_per_transaction AS "minimumAmountPerTransaction",
                programs.maximum_amount_per_transaction AS "maximumAmountPerTransaction",
                quota.remaining_deduction_quota_per_day AS "remainingDeductionQuotaPerDay",
                quota.remaining_deduction_quota_per_month AS "remainingDeductionQuotaPerMonth"
                FROM public.partner as partner
                INNER JOIN public.cost_package AS package ON (id = cost_package_id)
                LEFT JOIN public.partner_quota AS quota ON (code = quota.partner_code)
                INNER JOIN public.partner_program AS programs ON (code = programs.partner_code)
                LEFT JOIN LATERAL (SELECT code, amount FROM public.discount_program
                WHERE start_date <= NOW()::date AND NOW()::date <= end_date AND is_active = true AND partner_code = partner.code
                FETCH FIRST 1 ROWS ONLY) AS discount ON true
                WHERE partner.code = $1 AND partner.is_deleted = false AND programs.is_active = true
                AND programs.start_date <= NOW()::date AND NOW()::date <= programs.end_date;`,
            values: [partnerCode]
        }
        try {
            let getIssuerResult = await dbClient.query(getIssuerQuery);
            if (getIssuerResult.rows.length === 0) {
                return wrapper.error(new NotFoundError("Issuer not found"));
            }
            return wrapper.data(getIssuerResult.rows[0]);
        }
        catch (error) {
            console.error(error)
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getAllAcquirers(page, limit, offset) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let getAllAcquirersQuery = {
            name: "get-acquirer-list",
            text: `SELECT  code, segment_id AS "segmentId", cost_package_id AS "costPackageId", name, cost_bearer_type AS "costBearerType",
                url_logo AS "urlLogo", unit, is_deleted AS "isDeleted", created_at AS "createdAt", updated_at AS "updatedAt", deleted_at AS "deletedAt"
                FROM public.partner
                WHERE is_acquirer IS true
                ORDER BY name
                LIMIT $1 OFFSET $2;`,
                values: [limit, offset]
        }
        let countDataQuery = {
            name: 'count-acquirer-list',
            text: `SELECT COUNT(*)
                FROM public.partner
                WHERE is_acquirer IS true;`
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
            text: `SELECT code, name, url_logo AS "urlLogo", unit
                FROM public.partner as partners
                WHERE EXISTS (SELECT 1 FROM public.partner_program WHERE partners.code = partner_code
                AND start_date <= NOW()::date AND NOW()::date <= end_date AND is_active = true)
                AND partners.is_acquirer IS true AND partners.is_deleted = false
                ORDER BY name
                LIMIT $1 OFFSET $2;`,
                values: [limit, offset]
        }
        let countActiveAcquirersQuery = {
            name: 'count-active-acquirer-list',
            text: `SELECT COUNT(*)
                FROM public.partner as partners
                WHERE EXISTS (SELECT 1 FROM public.partner_program WHERE partners.code = partner_code
                AND start_date <= NOW()::date AND NOW()::date <= end_date AND is_active = true)
                AND partners.is_acquirer IS true AND partners.is_deleted = false`
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
            text: `SELECT  code, exchange_rate AS "exchangeRate"
                FROM public.partner
                INNER JOIN public.partner_program AS programs ON (code = programs.partner_code)
                WHERE code = $1 AND is_deleted = false AND programs.is_active = true
                AND programs.start_date <= NOW()::date AND NOW()::date <= programs.end_date;`,
            values: [partnerCode]
        }
        try {
            let getAcquireResult = await dbClient.query(getAcquirerQuery);
            if (getAcquireResult.rows.length === 0) {
                return wrapper.error(new NotFoundError("Acquirer not found"));
            }
            return wrapper.data(getAcquireResult.rows[0]);
        }
        catch (error) {
            console.error(error)
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

}

module.exports = Partner;
