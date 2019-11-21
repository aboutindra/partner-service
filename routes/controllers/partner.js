const partnerHandler = require('../../core/partner');

const routes = (server) => {
    server.post('/api/v1/partners', [], partnerHandler.insertPartner);
    server.put('/api/v1/partners/:code', [], partnerHandler.updatePartner);
    server.delete('/api/v1/partners/:code', [], partnerHandler.softDeletePartner);
    server.get('/api/v1/partners', [], partnerHandler.getPartners);
    server.get('/api/v1/partners/active-partners', [], partnerHandler.getActivePartners);
    server.get('/api/v1/partners/issuers', [], partnerHandler.getIssuers);
    server.get('/api/v1/partners/acquirers', [], partnerHandler.getAcquirers);
    server.get('/api/v1/partners/active-acquirers', [], partnerHandler.getActiveAcquirers);
    server.get('/api/v1/partners/active-issuers', [], partnerHandler.getActiveIssuers);
}

module.exports = {
    routes
};
