const partnerHandler = require('../../core/partner');
const validator = require('../../utilities/validator/partnerValidator');

const routes = (server) => {
    server.post('/api/v1/partners', [validator.validateInsertPartner], partnerHandler.insertPartner);
    server.put('/api/v1/partners/:code', [validator.validateUpdatePartner], partnerHandler.updatePartner);
    server.delete('/api/v1/partners/:code', [], partnerHandler.deletePartner);
    server.get('/api/v1/partners', [validator.validateGetPartner], partnerHandler.getPartners);
    server.get('/api/v1/active-partners', [validator.validateGetPartner], partnerHandler.getActivePartners);
    server.get('/api/v1/partners/issuers', [validator.validateGetPartner], partnerHandler.getIssuers);
    server.get('/api/v1/partners/acquirers', [validator.validateGetPartner], partnerHandler.getAcquirers);
    server.get('/api/v1/partners/active-acquirers', [validator.validateGetPartner], partnerHandler.getActiveAcquirers);
    server.get('/api/v1/partners/active-issuers', [validator.validateGetPartner], partnerHandler.getActiveIssuers);
    server.get('/api/v1/partners/active-issuers/:partnerCode', [], partnerHandler.getIssuer);
    server.get('/api/v1/partners/active-acquirers/:partnerCode', [], partnerHandler.getAcquirer);
}

module.exports = {
    routes
};
