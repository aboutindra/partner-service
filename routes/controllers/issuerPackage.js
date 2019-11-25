const packageHandler = require('../../core/issuerPackage');

const routes = (server) => {
    server.post('/api/v1/packages/issuers', [], packageHandler.insertPackage);
    server.put('/api/v1/packages/issuers/:id', [], packageHandler.updatePackage);
    server.delete('/api/v1/packages/issuers/:id', [], packageHandler.deletePackage);
    server.get('/api/v1/packages/issuers', [], packageHandler.getPackages);
}

module.exports = {
    routes
}