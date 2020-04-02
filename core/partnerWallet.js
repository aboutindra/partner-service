const wrapper = require('../utilities/wrapper');
const { validationResult } = require('express-validator');
const { SUCCESS:successCode } = require('../enum/httpStatusCode');
const { BadRequestError } = require('../utilities/error');
const PartnerWallet = require('../databases/postgresql/models/partnerWallet');
const partnerWallet = new PartnerWallet(process.env.POSTGRESQL_DATABASE_PARTNER);

const upsertWallet = async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        let error = wrapper.error(new BadRequestError("Invalid input parameter"));
        error.data = errors.array();
        wrapper.response(response, false, error);
        return;
    }

    let { partnerCode, walletCode } = request.body;
    partnerCode = partnerCode.toUpperCase();

    let result = await partnerWallet.upsertWallet(partnerCode, walletCode);
    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Partner wallet added", successCode.CREATED);
    }
    return;
}

const deleteWallet = async (request, response) => {
    let { partnerCode } = request.params;
    partnerCode = partnerCode.toUpperCase();

    let result = await partnerWallet.deleteWallet(partnerCode);
    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Partner wallet deleted", successCode.OK);
    }
}

const getWalletByPartnerCode = async (request, response) => {
    let { partnerCode } = request.params;
    partnerCode = partnerCode.toUpperCase();

    let result = await partnerWallet.getWalletByPartnerCode(partnerCode);
    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Partner wallet retrieved", successCode.OK);
    }
}

module.exports = {
    upsertWallet,
    deleteWallet,
    getWalletByPartnerCode
}
