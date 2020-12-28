const apm = require('elastic-apm-node');
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
        const dbClient = postgresqlWrapper.getConnection(this.database);
        const insertPartnerQuery = {
            name: "add-new-partner",
            text: `INSERT INTO public.partner(
                code, segment_id, cost_package_id, name, is_acquirer, is_issuer, cost_bearer_type, url_logo, unit, is_deleted, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7::cost_bearer_type, $8, $9, $10, $11, $12);`,
            values: [code, segmentId, costPackageId, name, isAcquirer, isIssuer, costBearerType, urlLogo, unit, false, new Date(), new Date()]
        }

        try {
            const insertQuotaResult = await dbClient.query(insertPartnerQuery);
            if (insertQuotaResult.rowCount === 0) {
                return wrapper.error(new NotFoundError("Failed add new partner"));
            }
            return wrapper.data(insertQuotaResult.rows);
        }
        catch (error) {
            apm.captureError(error);
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
        const dbClient = postgresqlWrapper.getConnection(this.database);
        const updatePartnerQuery = {
            name: "update-partner",
            text: `UPDATE public.partner
                SET segment_id = $2, cost_package_id = $3, name = $4, is_acquirer = $5, is_issuer = $6, cost_bearer_type = $7::cost_bearer_type,
                url_logo = $8, unit = $9, updated_at = $10
                WHERE code = $1;`,
            values: [code, segmentId, costPackageId, name, isAcquirer, isIssuer, costBearerType, urlLogo, unit, new Date()]
        }

        try {
            const updatePartnerResult = await dbClient.query(updatePartnerQuery);
            if (updatePartnerResult.rowCount === 0) {
                return wrapper.error(new NotFoundError("Partner not found"));
            }
            return wrapper.data(updatePartnerResult.rows);
        }
        catch (error) {
            apm.captureError(error);
            if (error.code === errorCode.FOREIGN_KEY_VIOLATION) {
                return wrapper.error(new ForbiddenError("Id not exist"));
            }
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async softDeletePartner(code) {
        const dbClient = postgresqlWrapper.getConnection(this.database);
        const deleteDiscountQuery = {
            name: 'soft-delete-partner-by-partner-code',
            text: `UPDATE public.partner
                SET is_deleted = true, updated_at = $2, deleted_at = $3
                WHERE code = $1`,
            values: [code, new Date(), new Date()]
        }

        try {
            const deletePartnerResult = await dbClient.query(deleteDiscountQuery);
            if (deletePartnerResult.rowCount === 0) {
                return wrapper.error(new NotFoundError("Partner not found"));
            }
            return wrapper.data(deletePartnerResult.rows);
        }
        catch (error) {
            apm.captureError(error);
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getAllPartner(page, limit, offset, search) {
        const dbClient = postgresqlWrapper.getConnection(this.database);
        const getAllPartnerQuery = {
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
        const countDataQuery = {
            name: 'count-partner-list',
            text: `SELECT COUNT(*)
                FROM public.partner
                WHERE code = $1 OR $1 IS NULL OR lower(name) LIKE lower('%' || $1 || '%');`,
            values: [search]
        }

        try {
            const getAllPartnersResult = await dbClient.query(getAllPartnerQuery);
            if (getAllPartnersResult.rows.length === 0) {
                return wrapper.error(new NotFoundError(PartnerResponseMessage.PARTNER_NOT_FOUND));
            }
            const countAllPartnersResult = await dbClient.query(countDataQuery);
            const totalData = parseInt(countAllPartnersResult.rows[0].count);
            let totalPage = Math.ceil(totalData / limit);
            if (limit === null) {
                totalPage = 1;
            }
            const totalDataOnPage = getAllPartnersResult.rows.length;
            const meta = {
                page: page || 1,
                totalData,
                totalPage,
                totalDataOnPage
            }

            return wrapper.paginationData(getAllPartnersResult.rows, meta);
        }
        catch (error) {
            apm.captureError(error);
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getPartnerByCode(code) {
        const dbClient = postgresqlWrapper.getConnection(this.database);
        const getPartnerQuery = {
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
            const getPartnerByCodeResult = await dbClient.query(getPartnerQuery);
            if (getPartnerByCodeResult.rows.length === 0) {
                return wrapper.error(new NotFoundError(PartnerResponseMessage.PARTNER_NOT_FOUND));
            }
            return wrapper.data(getPartnerByCodeResult.rows[0]);
        }
        catch (error) {
            apm.captureError(error);
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getAllActivePartner(page, limit, offset) {
        const dbClient = postgresqlWrapper.getConnection(this.database);
        const getAllActivePartnerQuery = {
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
        const countDataQuery = {
            name: 'count-active-partner',
            text: `SELECT COUNT(*)
                FROM public.partner
                WHERE is_deleted = false;`
        }
        try {
            const getAllActivePartnerResult = await dbClient.query(getAllActivePartnerQuery);
            if (getAllActivePartnerResult.rows.length === 0) {
                return wrapper.error(new NotFoundError(PartnerResponseMessage.PARTNER_NOT_FOUND));
            }
            const countAllActivePartnerResult = await dbClient.query(countDataQuery);
            const totalData = parseInt(countAllActivePartnerResult.rows[0].count);
            let totalPage = Math.ceil(totalData / limit);
            if (limit === null) {
                totalPage = 1;
            }
            const totalDataOnPage = getAllActivePartnerResult.rows.length;
            const meta = {
                page: page || 1,
                totalData,
                totalPage,
                totalDataOnPage
            }

            return wrapper.paginationData(getAllActivePartnerResult.rows, meta);
        }
        catch (error) {
            apm.captureError(error);
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getAllIssuers(page, limit, offset) {
        const dbClient = postgresqlWrapper.getConnection(this.database);
        const getAllIssuersQuery = {
            name: "get-issuer-list",
            text: `SELECT code, segment_id AS "segmentId", cost_package_id AS "costPackageId", name, cost_bearer_type AS "costBearerType",
                url_logo AS "urlLogo", unit, is_deleted AS "isDeleted", created_at AS "createdAt", updated_at AS "updatedAt", deleted_at AS "deletedAt"
                FROM public.partner
                WHERE is_issuer IS true
                ORDER BY name
                LIMIT $1 OFFSET $2;`,
                values: [limit, offset]
        }
        const countDataQuery = {
            name: 'count-issuer-list',
            text: `SELECT COUNT(*)
                FROM public.partner
                WHERE is_issuer IS true;`
        }
        try {
            const getAllIssuersResult = await dbClient.query(getAllIssuersQuery);
            if (getAllIssuersResult.rows.length === 0) {
                return wrapper.error(new NotFoundError(PartnerResponseMessage.PARTNER_NOT_FOUND));
            }
            const countAllIssuersResult = await dbClient.query(countDataQuery);
            const totalData = parseInt(countAllIssuersResult.rows[0].count);
            let totalPage = Math.ceil(totalData / limit);
            if (limit === null) {
                totalPage = 1;
            }
            const totalDataOnPage = getAllIssuersResult.rows.length;
            const meta = {
                page: page || 1,
                totalData,
                totalPage,
                totalDataOnPage
            }

            return wrapper.paginationData(getAllIssuersResult.rows, meta);
        }
        catch (error) {
            apm.captureError(error);
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getAllActiveIssuers(page, limit, offset) {
        const dbClient = postgresqlWrapper.getConnection(this.database);
        const getAllActiveIssuersQuery = {
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
        const countActiveIssuersQuery = {
            name: 'count-active-issuer-list',
            text: `SELECT COUNT(*)
                FROM public.partner as partners
                WHERE EXISTS (SELECT 1 FROM public.partner_program WHERE partners.code = partner_code
                AND start_date <= NOW()::date AND NOW()::date <= end_date AND is_active = true)
                AND partners.is_issuer IS true AND partners.is_deleted = false`
        }
        try {
            const getAllActiveIssuersResult = await dbClient.query(getAllActiveIssuersQuery);
            if (getAllActiveIssuersResult.rows.length === 0) {
                return wrapper.error(new NotFoundError(PartnerResponseMessage.PARTNER_NOT_FOUND));
            }
            const countAllActiveIssuersResult = await dbClient.query(countActiveIssuersQuery);
            const totalData = parseInt(countAllActiveIssuersResult.rows[0].count);
            let totalPage = Math.ceil(totalData / limit);
            if (limit === null) {
                totalPage = 1;
            }
            const totalDataOnPage = getAllActiveIssuersResult.rows.length;
            const meta = {
                page: page || 1,
                totalData,
                totalPage,
                totalDataOnPage
            }

            return wrapper.paginationData(getAllActiveIssuersResult.rows, meta);
        }
        catch (error) {
            apm.captureError(error);
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getIssuer(partnerCode) {
        const dbClient = postgresqlWrapper.getConnection(this.database);
        const getIssuerQuery = {
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
                WHERE partner.code = $1 AND partner.is_deleted = false AND programs.is_active = true AND partner.is_issuer = true
                AND programs.start_date <= NOW()::date AND NOW()::date <= programs.end_date;`,
            values: [partnerCode]
        }
        try {
            const getIssuerResult = await dbClient.query(getIssuerQuery);
            if (getIssuerResult.rows.length === 0) {
                return wrapper.error(new NotFoundError("Issuer not found"));
            }
            return wrapper.data(getIssuerResult.rows[0]);
        }
        catch (error) {
            apm.captureError(error);
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getAllAcquirers(page, limit, offset) {
        const dbClient = postgresqlWrapper.getConnection(this.database);
        const getAllAcquirersQuery = {
            name: "get-acquirer-list",
            text: `SELECT  code, segment_id AS "segmentId", cost_package_id AS "costPackageId", name, cost_bearer_type AS "costBearerType",
                url_logo AS "urlLogo", unit, is_deleted AS "isDeleted", created_at AS "createdAt", updated_at AS "updatedAt", deleted_at AS "deletedAt"
                FROM public.partner
                WHERE is_acquirer IS true
                ORDER BY name
                LIMIT $1 OFFSET $2;`,
                values: [limit, offset]
        }
        const countDataQuery = {
            name: 'count-acquirer-list',
            text: `SELECT COUNT(*)
                FROM public.partner
                WHERE is_acquirer IS true;`
        }
        try {
            const getAllAcquirersResult = await dbClient.query(getAllAcquirersQuery);
            if (getAllAcquirersResult.rows.length === 0) {
                return wrapper.error(new NotFoundError(PartnerResponseMessage.PARTNER_NOT_FOUND));
            }
            const countAllAcquirersResult = await dbClient.query(countDataQuery);
            const totalData = parseInt(countAllAcquirersResult.rows[0].count);
            let totalPage = Math.ceil(totalData / limit);
            if (limit === null) {
                totalPage = 1;
            }
            const totalDataOnPage = getAllAcquirersResult.rows.length;
            const meta = {
                page: page || 1,
                totalData,
                totalPage,
                totalDataOnPage
            }

            return wrapper.paginationData(getAllAcquirersResult.rows, meta);
        }
        catch (error) {
            apm.captureError(error);
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getAllActiveAcquirers(page, limit, offset) {
        const dbClient = postgresqlWrapper.getConnection(this.database);
        const getAllActiveAcquirersQuery = {
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
        const countActiveAcquirersQuery = {
            name: 'count-active-acquirer-list',
            text: `SELECT COUNT(*)
                FROM public.partner as partners
                WHERE EXISTS (SELECT 1 FROM public.partner_program WHERE partners.code = partner_code
                AND start_date <= NOW()::date AND NOW()::date <= end_date AND is_active = true)
                AND partners.is_acquirer IS true AND partners.is_deleted = false`
        }
        try {
            const getAllActiveAcquirersResult = await dbClient.query(getAllActiveAcquirersQuery);
            if (getAllActiveAcquirersResult.rows.length === 0) {
                return wrapper.error(new NotFoundError(PartnerResponseMessage.PARTNER_NOT_FOUND));
            }
            const count = await dbClient.query(countActiveAcquirersQuery);
            const totalData = parseInt(count.rows[0].count);
            let totalPage = Math.ceil(totalData / limit);
            if (limit === null) {
                totalPage = 1;
            }
            const totalDataOnPage = getAllActiveAcquirersResult.rows.length;
            const meta = {
                page: page || 1,
                totalData,
                totalPage,
                totalDataOnPage
            }

            return wrapper.paginationData(getAllActiveAcquirersResult.rows, meta);
        }
        catch (error) {
            apm.captureError(error);
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getAcquirer(partnerCode) {
        const dbClient = postgresqlWrapper.getConnection(this.database);
        const getAcquirerQuery = {
            name: "get-acquirer",
            text: `SELECT  code, name, exchange_rate AS "exchangeRate"
                FROM public.partner
                INNER JOIN public.partner_program AS programs ON (code = programs.partner_code)
                WHERE code = $1 AND is_deleted = false AND programs.is_active = true AND is_acquirer = true
                AND programs.start_date <= NOW()::date AND NOW()::date <= programs.end_date;`,
            values: [partnerCode]
        }
        try {
            const getAcquireResult = await dbClient.query(getAcquirerQuery);
            if (getAcquireResult.rows.length === 0) {
                return wrapper.error(new NotFoundError("Acquirer not found"));
            }
            return wrapper.data(getAcquireResult.rows[0]);
        }
        catch (error) {
            apm.captureError(error);
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getCounts() {
        const dbClient = postgresqlWrapper.getConnection(this.database);
        const date = new Date().toISOString();

        const dateLastMonth = new Date();
        dateLastMonth.setMonth(dateLastMonth.getMonth() - 1);

        const getCountQuery = {
            name: "get-partner-count",
            text: `SELECT COUNT(CASE WHEN is_acquirer = true THEN partner.code END) AS "isAcquirer",
                COUNT(CASE WHEN is_issuer = true THEN partner.code END) AS "isIssuer",
                COUNT(CASE WHEN is_acquirer = true AND is_issuer = true THEN partner.code END) AS "isBoth",
                COUNT (*) AS "total",
                COUNT (CASE WHEN created_at <= ${date} AND created_at >= ${dateLastMonth.toISOString()} THEN partner.created_at END) AS "totalPartnerLastMonth"
                FROM public.partner AS partner;`
        }
        try {
            const getCountResult = await dbClient.query(getCountQuery);
            if (getCountResult.rows.length === 0) {
                return wrapper.error(new NotFoundError("Partner count not found"));
            }
            console.log(getCountResult.rows[0])
            return wrapper.data(getCountResult.rows[0]);
        }
        catch (error) {
            apm.captureError(error)
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getImages(page, limit, offset, search) {
        const dbClient = postgresqlWrapper.getConnection(this.database);
        const getImagesQuery = {
            name: "get-partner-images",
            text: `SELECT code, url_logo AS "urlLogo"
                FROM public.partner AS partner
                WHERE code = $3 OR $3 IS NULL OR lower(name) LIKE lower('%' || $3 || '%')
                ORDER BY code
                LIMIT $1 OFFSET $2;;`,
            values: [limit, offset, search]
        }
        const countImages = {
            name: 'count-partner-images',
            text: `SELECT COUNT(*)
                FROM public.partner AS partner
                WHERE code = $1 OR $1 IS NULL OR lower(name) LIKE lower('%' || $1 || '%');`,
            values: [search]
        }
        try {
            const getImagesResult = await dbClient.query(getImagesQuery);
            if (getImagesResult.rows.length === 0) {
                return wrapper.error(new NotFoundError(PartnerResponseMessage.PARTNER_NOT_FOUND));
            }
            const count = await dbClient.query(countImages);
            const totalData = parseInt(count.rows[0].count);
            let totalPage = Math.ceil(totalData / limit);
            if (limit === null) {
                totalPage = 1;
            }
            const totalDataOnPage = getImagesResult.rows.length;
            const meta = {
                page: page || 1,
                totalData,
                totalPage,
                totalDataOnPage
            }

            return wrapper.paginationData(getImagesResult.rows, meta);
        }
        catch (error) {
            apm.captureError(error);
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getAllActiveIssuersConfig(page, limit, offset) {
        const dbClient = postgresqlWrapper.getConnection(this.database);
        const getAllActiveIssuersConfigQuery = {
            name: "get-active-issuers-config",
            text: `SELECT partners.code, partners.name, partners.cost_bearer_type AS "costBearerType", programs.exchange_rate AS "exchangeRate",
                partners.url_logo AS "urlLogo", partners.unit,
                CASE WHEN discount.amount IS NOT NULL THEN CEIL(package.amount::NUMERIC * (100 - discount.amount) / 100) ELSE package.amount END AS "costAmount",
                programs.minimum_amount_per_transaction AS "minimumAmountPerTransaction",
                programs.maximum_amount_per_transaction AS "maximumAmountPerTransaction",
                quota.remaining_deduction_quota_per_day AS "remainingDeductionQuotaPerDay",
                quota.remaining_deduction_quota_per_month AS "remainingDeductionQuotaPerMonth"
                FROM public.partner as partners
                INNER JOIN public.cost_package AS package ON (id = cost_package_id)
                INNER JOIN public.partner_program AS programs ON (code = programs.partner_code)
                LEFT JOIN public.partner_quota AS quota ON (code = quota.partner_code)
                LEFT JOIN LATERAL (SELECT code, amount FROM public.discount_program
                WHERE start_date <= NOW()::date AND NOW()::date <= end_date AND is_active = true AND partner_code = partners.code
                FETCH FIRST 1 ROWS ONLY) AS discount ON true
                WHERE programs.start_date <= NOW()::date AND NOW()::date <= programs.end_date AND programs.is_active = true
                AND partners.is_issuer IS true AND partners.is_deleted = false
                ORDER BY name
                LIMIT $1 OFFSET $2;`,
                values: [limit, offset]
        }
        const countActiveIssuersConfigQuery = {
            name: 'count-active-issuers-config',
            text: `SELECT COUNT(*)
                FROM public.partner as partners
                INNER JOIN public.cost_package AS package ON (id = cost_package_id)
                INNER JOIN public.partner_program AS programs ON (code = programs.partner_code)
                LEFT JOIN public.partner_quota AS quota ON (code = quota.partner_code)
                LEFT JOIN LATERAL (SELECT code, amount FROM public.discount_program
                WHERE start_date <= NOW()::date AND NOW()::date <= end_date AND is_active = true AND partner_code = partners.code
                FETCH FIRST 1 ROWS ONLY) AS discount ON true
                WHERE programs.start_date <= NOW()::date AND NOW()::date <= programs.end_date AND programs.is_active = true
                AND partners.is_issuer IS true AND partners.is_deleted = false`
        }
        try {
            const getAllActiveIssuersConfigResult = await dbClient.query(getAllActiveIssuersConfigQuery);
            if (getAllActiveIssuersConfigResult.rows.length === 0) {
                return wrapper.error(new NotFoundError(PartnerResponseMessage.PARTNER_NOT_FOUND));
            }
            const countAllActiveIssuersConfigResult = await dbClient.query(countActiveIssuersConfigQuery);
            const totalData = parseInt(countAllActiveIssuersConfigResult.rows[0].count);
            let totalPage = Math.ceil(totalData / limit);
            if (limit === null) {
                totalPage = 1;
            }
            const totalDataOnPage = getAllActiveIssuersConfigResult.rows.length;
            const meta = {
                page: page || 1,
                totalData,
                totalPage,
                totalDataOnPage
            }

            return wrapper.paginationData(getAllActiveIssuersConfigResult.rows, meta);
        }
        catch (error) {
            apm.captureError(error);
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }
}

module.exports = Partner;
