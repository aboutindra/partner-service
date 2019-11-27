const partnerHandler = require('../../core/partner');
const validator = require('../../utilities/validator/partnerValidator');

const routes = (server) => {
    server.post('/api/v1/partners', [validator.validateInsert], partnerHandler.insertPartner);
    server.put('/api/v1/partners/:code', [validator.validateUpdate], partnerHandler.updatePartner);
    server.delete('/api/v1/partners/:code', [], partnerHandler.deletePartner);
    server.get('/api/v1/partners', [], partnerHandler.getPartners);
    server.get('/api/v1/active-partners', [], partnerHandler.getActivePartners);
    server.get('/api/v1/partners/issuers', [], partnerHandler.getIssuers);
    server.get('/api/v1/partners/acquirers', [], partnerHandler.getAcquirers);
    server.get('/api/v1/partners/active-acquirers', [], partnerHandler.getActiveAcquirers);
    server.get('/api/v1/partners/active-issuers', [], partnerHandler.getActiveIssuers);
}

module.exports = {
    routes
};
