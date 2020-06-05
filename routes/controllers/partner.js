const partnerHandler = require('../../core/partner');
const validator = require('../../utilities/validator/partnerValidator');
const paginationValidator = require('../../utilities/validator/paginationValidator');

const routes = (server) => {
    server.post('/api/v1/partners', [validator.validateInsertPartner], partnerHandler.insertPartner);
    server.put('/api/v1/partners/:code', [validator.validateUpdatePartner], partnerHandler.updatePartner);
    server.delete('/api/v1/partners/:code', [], partnerHandler.deletePartner);
    server.get('/api/v1/partners', [validator.validateGetPartner, paginationValidator], partnerHandler.getPartners);
    server.get('/api/v1/active-partners', [paginationValidator], partnerHandler.getActivePartners);
    server.get('/api/v1/partners/issuers', [paginationValidator], partnerHandler.getIssuers);
    server.get('/api/v1/partners/acquirers', [paginationValidator], partnerHandler.getAcquirers);
    server.get('/api/v1/partners/active-acquirers', [paginationValidator], partnerHandler.getActiveAcquirers);
    server.get('/api/v1/partners/active-issuers', [paginationValidator], partnerHandler.getActiveIssuers);
    server.get('/api/v1/partners/active-issuers/:partnerCode', [], partnerHandler.getIssuer);
    server.get('/api/v1/partners/active-acquirers/:partnerCode', [], partnerHandler.getAcquirer);
}

module.exports = {
    routes
};
