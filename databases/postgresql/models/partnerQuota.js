const apm = require('elastic-apm-node');
const { NotFoundError, InternalServerError, ForbiddenError } = require('../../../utilities/error');
const { ERROR:errorCode } = require('../errorCode');
const wrapper = require('../../../utilities/wrapper');
const postgresqlWrapper = require('../../postgresql');
const ResponseMessage = require('../../../enum/httpResponseMessage');

class PartnerQuota {
    constructor(database) {
        this.database = database;
    }

    async upsertQuota(partnerCode, remainingQuotaPerDay, remainingQuotaPerMonth) {
        const dbClient = postgresqlWrapper.getConnection(this.database);
        const inserQuotaQuery = {
            name: 'upsert-quota',
            text: `INSERT INTO public.partner_quota(
                partner_code, remaining_deduction_quota_per_day, remaining_deduction_quota_per_month, is_deleted, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (partner_code) DO UPDATE
                SET remaining_deduction_quota_per_day = $2, remaining_deduction_quota_per_month = $3, updated_at = $5;`,
            values: [partnerCode, remainingQuotaPerDay, remainingQuotaPerMonth, new Date(), new Date()]
        }

        try {
            const updateQuotaResult = await dbClient.query(inserQuotaQuery);
            if (updateQuotaResult.rowCount === 0) {
                return wrapper.error(new NotFoundError("Failed add new partner quota"));
            }
            return wrapper.data(updateQuotaResult.rows);
        }
        catch (error) {
            if (error.code === errorCode.FOREIGN_KEY_VIOLATION) {
                return wrapper.error(new ForbiddenError("Partner doesn't exist"));
            }
            apm.captureError(error);
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async deductQuota(partnerCode, dailyQuotaDeduction, monthlyQuotaDeduction) {
        const dbClient = postgresqlWrapper.getConnection(this.database);
        const updateQuotaQuery = {
            name: 'update-quota',
            text: `UPDATE public.partner_quota
                SET remaining_deduction_quota_per_day = (CASE
                    WHEN remaining_deduction_quota_per_day IS NULL
                        THEN remaining_deduction_quota_per_day
                    ELSE remaining_deduction_quota_per_day - $2
                END),
                remaining_deduction_quota_per_month = (CASE
                    WHEN remaining_deduction_quota_per_month IS NULL
                        THEN remaining_deduction_quota_per_month
                    ELSE remaining_deduction_quota_per_month - $3
                END),
                updated_at = $4
                WHERE partner_code = $1;`,
            values: [partnerCode, dailyQuotaDeduction, monthlyQuotaDeduction, new Date()]
        }

        try {
            const result = await dbClient.query(updateQuotaQuery);
            if (result.rowCount === 0) {
                return wrapper.error(new NotFoundError("Partner quota not found"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            apm.captureError(error);
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getAllQuota(page, limit, offset) {
        const dbClient = postgresqlWrapper.getConnection(this.database);
        const getAllQuotaQuery = {
            name: 'get-all-quota',
            text: `SELECT partner_code AS "partnerCode", remaining_deduction_quota_per_day AS "remainingQuotaPerDay",
                remaining_deduction_quota_per_month AS "remainingQuotaPerMonth", is_deleted AS "isDeleted",
                created_at AS "createdAt", updated_at AS "updatedAt", deleted_at AS "deletedAt"
                FROM public.partner_quota
                ORDER BY partner_code
                LIMIT $1 OFFSET $2;`,
                values: [limit, offset]
        }
        const countDataQuery = {
            name: 'count-all-quota',
            text: `SELECT COUNT(*)
                FROM public.partner_quota`
        }

        try {
            const getAllQuotaResult = await dbClient.query(getAllQuotaQuery);
            if (getAllQuotaResult.rows.length === 0) {
                return wrapper.error(new NotFoundError("Partner(s) not found"));
            }
            const countAllQuotaResult = await dbClient.query(countDataQuery);
            const totalData = parseInt(countAllQuotaResult.rows[0].count);
            let totalPage = Math.ceil(totalData / limit);
            if (limit === null) {
                totalPage = 1;
            }
            const totalDataOnPage = getAllQuotaResult.rows.length;
            const meta = {
                page: page || 1,
                totalData,
                totalPage,
                totalDataOnPage
            }

            return wrapper.paginationData(getAllQuotaResult.rows, meta);
        }
        catch (error) {
            apm.captureError(error);
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getQuotaByPartnerCode(partnerCode) {
        const dbClient = postgresqlWrapper.getConnection(this.database);
        const getPartnerQuotaQuery = {
            name: 'get-quota-partner',
            text: `SELECT partner_code AS "partnerCode", remaining_deduction_quota_per_day AS "remainingQuotaPerDay",
                remaining_deduction_quota_per_month AS "remainingQuotaPerMonth"
                FROM public.partner_quota
                WHERE partner_code = $1`,
            values: [partnerCode]
        }

        try {
            const result = await dbClient.query(getPartnerQuotaQuery);
            if (result.rows.length === 0) {
                return wrapper.error(new NotFoundError("Partner quota not found"));
            }
            return wrapper.data(result.rows[0]);
        }
        catch (error) {
            apm.captureError(error);
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }
}

module.exports = PartnerQuota;
