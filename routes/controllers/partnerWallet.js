const partnerWalletHandler = require('../../core/partnerWallet');
const validator = require('../../utilities/validator/partnerWalletValidator');
const validatePagination = require('../../utilities/validator/paginationValidator');

const routes = (server) => {
    server.post('/api/v1/wallets', [validator.validateInsertPartnerWallet], partnerWalletHandler.upsertWallet);
    server.delete('/api/v1/wallets/:partnerCode', [], partnerWalletHandler.deleteWallet);
    server.get('/api/v1/wallets/:partnerCode', [], partnerWalletHandler.getWalletByPartnerCode);
    server.get('/api/v1/wallets', [validatePagination], partnerWalletHandler.getWallets);
}

module.exports = {
    routes
}
