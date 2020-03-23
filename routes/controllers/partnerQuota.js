const partnerQuotaHandler = require('../../core/partnerQuota');
const validator = require('../../utilities/validator/partnerQuotaValidator');

const routes = (server) => {
    server.post('/api/v1/quotas', [validator.validateInsertPartnerQuota], partnerQuotaHandler.upsertQuota);
    server.put('/api/v1/quotas/:partnerCode', [validator.validateDeductionPartnerQuota], partnerQuotaHandler.deductQuota);
    server.get('/api/v1/quotas/:partnerCode', [], partnerQuotaHandler.getRemainingQuota);
    server.get('/api/v1/quotas', [validator.validateGetPartnerQuota], partnerQuotaHandler.getAllRemainingQuota);
}

module.exports = {
    routes
}
