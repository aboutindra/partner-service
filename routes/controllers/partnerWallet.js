const partnerWalletHandler = require('../../core/partnerWallet');
const validator = require('../../utilities/validator/partnerWalletValidator');

const routes = (server) => {
    server.post('/api/v1/wallets', [validator.validateInsertPartnerWallet], partnerWalletHandler.upsertWallet);
    server.delete('/api/v1/wallets/:partnerCode', [], partnerWalletHandler.deleteWallet);
    server.get('/api/v1/wallets/:partnerCode', [], partnerWalletHandler.getWalletByPartnerCode);
}

module.exports = {
    routes
}
