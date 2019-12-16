const partnerHandler = require('../../core/partner');
const validator = require('../../utilities/validator/partnerValidator');

const routes = (server) => {
    server.post('/api/v1/partners', [validator.validateInsert], partnerHandler.insertPartner);
    server.put('/api/v1/partners/:code', [validator.validateUpdate], partnerHandler.updatePartner);
    server.delete('/api/v1/partners/:code', [], partnerHandler.deletePartner);
    server.get('/api/v1/partners', [validator.validateGet], partnerHandler.getPartners);
    server.get('/api/v1/active-partners', [validator.validateGet], partnerHandler.getActivePartners);
    server.get('/api/v1/partners/issuers', [validator.validateGet], partnerHandler.getIssuers);
    server.get('/api/v1/partners/acquirers', [validator.validateGet], partnerHandler.getAcquirers);
    server.get('/api/v1/partners/active-acquirers', [validator.validateGet], partnerHandler.getActiveAcquirers);
    server.get('/api/v1/partners/active-issuers', [validator.validateGet], partnerHandler.getActiveIssuers);
    server.get('/api/v1/partners/active-issuers/:partnerCode', [], partnerHandler.getIssuer);
    server.get('/api/v1/partners/active-acquirers/:partnerCode', [], partnerHandler.getAcquirer);
}

module.exports = {
    routes
};
