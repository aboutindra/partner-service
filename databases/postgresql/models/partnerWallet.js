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
        let dbPool = postgresqlWrapper.getConnection(this.database);
        let upsertWalletQuery = {
            name: 'upsert-wallet',
            text: `INSERT INTO public.partner_wallet(
                partner_code, wallet_code, is_deleted, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (partner_code) DO UPDATE
                SET wallet_code = $2, updated_at = $4;`,
            values: [partnerCode, walletCode, false, new Date(), new Date()]
        }
        try {
            let result = await dbPool.query(upsertWalletQuery);
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
        let dbPool = postgresqlWrapper.getConnection(this.database);
        let deleteWalletQuery = {
            name: 'delete-wallet',
            text: `UPDATE public.partner_wallet
                SET is_deleted = true, updated_at = $2, deleted_at = $3
                WHERE partner_code = $1;`,
            values: [partnerCode, new Date(), new Date()]
        }
        try {
            let result = await dbPool.query(deleteWalletQuery);
            if (result.rowCount === 0) {
                return wrapper.error(new NotFoundError("Failed to delete partner wallet"));
            }
            return wrapper.data(result.rows);
        } catch (error) {
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }

    async getWalletByPartnerCode (partnerCode) {
        let dbPool = postgresqlWrapper.getConnection(this.database);
        let getWalletQuery = {
            name: 'get-wallet',
            text: `SELECT partner_code AS "partnerCode", wallet_code AS "walletCode"
                FROM public.partner_wallet
                WHERE partner_code = $1;`,
            values: [partnerCode]
        }
        try {
            let result = await dbPool.query(getWalletQuery);
            if (result.rows.length === 0) {
                return wrapper.error(new NotFoundError("Partner wallet not found"));
            }
            return wrapper.data(result.rows[0]);
        } catch (error) {
            return wrapper.error(new InternalServerError(ResponseMessage.INTERNAL_SERVER_ERROR));
        }
    }
}

module.exports = PartnerWallet;
