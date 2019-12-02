const partnerQuotaHandler = require('../../core/partnerQuota');
const validator = require('../../utilities/validator/partnerQuotaValidator');

const routes = (server) => {
    server.post('/api/v1/quotas', [validator.validateInsert], partnerQuotaHandler.upsertQuota);
    server.put('/api/v1/quotas/:partnerCode', [validator.validateDeduction], partnerQuotaHandler.deductQuota);
    server.get('/api/v1/quotas/:partnerCode', [], partnerQuotaHandler.getRemainingQuota);
    server.get('/api/v1/quotas', [], partnerQuotaHandler.getAllRemainingQuota);
}

module.exports = {
    routes
}