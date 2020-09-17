const { NotFoundError, InternalServerError, ForbiddenError } = require('../../../utilities/error');
const { ERROR:errorCode } = require('../errorCode');
const wrapper = require('../../../utilities/wrapper');
const postgresqlWrapper = require('../../postgresql');
const ResponseMessage = require('../../../enum/httpResponseMessage');

class PartnerWallet{
    constructor(database) {
        this.database = database;
    }

    async upsertWallet (partnerCode, walletCode) {
        const dbPool = postgresqlWrapper.getConnection(this.database);
        const upsertWalletQuery = {
            name: 'upsert-wallet',
            text: `INSERT INTO public.partner_wallet(
                partner_code, wallet_code, is_deleted, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (partner_code) DO UPDATE
                SET wallet_code = $2, updated_at = $4;`,
            values: [partnerCode, walletCode, false, new Date(), new Date()]
        }
        try {
            const result = await dbPool.query(upsertWalletQuery);
            if (result.rowCount === 0) {
                return wrapper.error(new NotFoundError("Failed to add new partner wallet"));
            }
            return wrapper.data(result.rows);
        } catch (error) {
            console.error(error);
            if (error.code === errorCode.FOREIGN_KEY_VIOLATION) {
                return wrapper.error(new ForbiddenError("Partner doesn't exist"));
            }
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async deleteWallet (partnerCode) {
        const dbPool = postgresqlWrapper.getConnection(this.database);
        const deleteWalletQuery = {
            name: 'delete-wallet',
            text: `UPDATE public.partner_wallet
                SET is_deleted = true, updated_at = $2, deleted_at = $3
                WHERE partner_code = $1;`,
            values: [partnerCode, new Date(), new Date()]
        }
        try {
            const result = await dbPool.query(deleteWalletQuery);
            if (result.rowCount === 0) {
                return wrapper.error(new NotFoundError("Failed to delete partner wallet"));
            }
            return wrapper.data(result.rows);
        } catch (error) {
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getWalletByPartnerCode (partnerCode) {
        const dbPool = postgresqlWrapper.getConnection(this.database);
        const getWalletQuery = {
            name: 'get-wallet',
            text: `SELECT partner_code AS "partnerCode", wallet_code AS "walletCode"
                FROM public.partner_wallet
                WHERE partner_code = $1 AND is_deleted = false;`,
            values: [partnerCode]
        }
        try {
            const result = await dbPool.query(getWalletQuery);
            if (result.rows.length === 0) {
                return wrapper.error(new NotFoundError("Partner wallet not found"));
            }
            return wrapper.data(result.rows[0]);
        } catch (error) {
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getWallets(page, limit, offset, search) {
        const dbPool = postgresqlWrapper.getConnection(this.database);
        const getWalletsQuery = {
            name: 'get-wallets',
            text: `SELECT partner_code AS "partnerCode", wallet_code AS "walletCode"
                FROM public.partner_wallet
                WHERE is_deleted = false AND (lower(partner_code) LIKE lower('%' || $3 || '%') OR $3 IS NULL)
                ORDER BY created_at
                LIMIT $1 OFFSET $2;`,
            values: [limit, offset, search]
        }
        const countWalletsQuery = {
            name: 'count-wallets',
            text: `SELECT COUNT(*)
                FROM public.partner_wallet
                WHERE is_deleted = false AND (lower(partner_code) LIKE lower('%' || $1 || '%') OR $1 IS NULL);`,
            values: [search]
        }
        try {
            const wallets = await dbPool.query(getWalletsQuery);
            if (wallets.rows.length === 0) {
                return wrapper.error(new NotFoundError("Partner wallet(s) not found"));
            }
            const walletCounter = await dbPool.query(countWalletsQuery);
            const totalData = parseInt(walletCounter.rows[0].count);
            let totalPage = Math.ceil(totalData / limit);
            if (limit === null) {
                totalPage = 1;
            }
            const totalDataOnPage = wallets.rows.length;
            const meta = {
                page: page || 1,
                totalData,
                totalPage,
                totalDataOnPage
            }
            return wrapper.paginationData(wallets.rows, meta);
        } catch (error) {
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }
}

module.exports = PartnerWallet;
