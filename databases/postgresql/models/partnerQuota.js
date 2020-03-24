const { NotFoundError, InternalServerError, ForbiddenError } = require('../../../utilities/error');
const { ERROR:errorCode } = require('../errorCode');
const wrapper = require('../../../utilities/wrapper');
const postgresqlWrapper = require('../../postgresql');

class PartnerQuota {
    constructor(database) {
        this.database = database;
    }

    async upsertQuota(partnerCode, remainingQuotaPerDay, remainingQuotaPerMonth) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let inserQuotaQuery = {
            name: 'upsert-quota',
            text: `INSERT INTO public.partner_quota(
                partner_code, remaining_deduction_quota_per_day, remaining_deduction_quota_per_month)
                VALUES ($1, $2, $3)
                ON CONFLICT (partner_code) DO UPDATE
                SET remaining_deduction_quota_per_day = $2, remaining_deduction_quota_per_month = $3;`,
            values: [partnerCode, remainingQuotaPerDay, remainingQuotaPerMonth]
        }

        try {
            let updateQuotaResult = await dbClient.query(inserQuotaQuery);
            if (updateQuotaResult.rowCount === 0) {
                return wrapper.error(new NotFoundError("Failed add new partner quota"));
            }
            return wrapper.data(updateQuotaResult.rows);
        }
        catch (error) {
            if (error.code === errorCode.FOREIGN_KEY_VIOLATION) {
                return wrapper.error(new ForbiddenError("Partner doesn't exist"));
            }
            return wrapper.error(new InternalServerError("Internal server error"));
        }
    }

    async deductQuota(partnerCode, dailyQuotaDeduction, monthlyQuotaDeduction) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let updateQuotaQuery = {
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
                END)
                WHERE partner_code = $1;`,
            values: [partnerCode, dailyQuotaDeduction, monthlyQuotaDeduction]
        }

        try {
            let result = await dbClient.query(updateQuotaQuery);
            if (result.rowCount === 0) {
                return wrapper.error(new NotFoundError("Partner quota not found"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            return wrapper.error(new InternalServerError("Internal server error"));
        }
    }

    async getAllQuota(page, limit, offset) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let getAllQuotaQuery = {
            name: 'get-all-quota',
            text: `SELECT partner_code AS "partnerCode", remaining_deduction_quota_per_day AS "remainingQuotaPerDay",
                remaining_deduction_quota_per_month AS "remainingQuotaPerMonth"
                FROM public.partner_quota
                ORDER BY partner_code
                LIMIT $1 OFFSET $2;`,
                values: [limit, offset]
        }
        let countDataQuery = {
            name: 'count-all-quota',
            text: `SELECT COUNT(*)
                FROM public.partner_quota`
        }

        try {
            let getAllQuotaResult = await dbClient.query(getAllQuotaQuery);
            if (getAllQuotaResult.rows.length === 0) {
                return wrapper.error(new NotFoundError("Partner(s) not found"));
            }
            let countAllQuotaResult = await dbClient.query(countDataQuery);
            let totalData = parseInt(countAllQuotaResult.rows[0].count);
            let totalPage = Math.ceil(totalData / limit);
            if (limit === null) {
                totalPage = 1;
            }
            let totalDataOnPage = getAllQuotaResult.rows.length;
            let meta = {
                page: page || 1,
                totalData,
                totalPage,
                totalDataOnPage
            }

            return wrapper.paginationData(getAllQuotaResult.rows, meta);
        }
        catch (error) {
            return wrapper.error(new InternalServerError("Internal server error"));
        }
    }

    async getQuotaByPartnerCode(partnerCode) {
        let dbClient = postgresqlWrapper.getConnection(this.database);
        let getPartnerQuotaQuery = {
            name: 'get-quota-partner',
            text: `SELECT partner_code AS "partnerCode", remaining_deduction_quota_per_day AS "remainingQuotaPerDay",
                remaining_deduction_quota_per_month AS "remainingQuotaPerMonth"
                FROM public.partner_quota
                WHERE partner_code = $1`,
            values: [partnerCode]
        }

        try {
            let result = await dbClient.query(getPartnerQuotaQuery);
            if (result.rows.length === 0) {
                return wrapper.error(new NotFoundError("Partner quota not found"));
            }
            return wrapper.data(result.rows);
        }
        catch (error) {
            return wrapper.error(new InternalServerError("Internal server error"));
        }
    }
}

module.exports = PartnerQuota;
