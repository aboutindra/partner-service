const packageHandler = require('../../core/acquirerPackage');

const routes = (server) => {
    server.post('/api/v1/packages/acquirers', [], packageHandler.insertPackage);
    server.put('/api/v1/packages/acquirers/:id', [], packageHandler.updatePackage);
    server.delete('/api/v1/packages/acquirers/:id', [], packageHandler.deletePackage);
    server.get('/api/v1/packages/acquirers', [], packageHandler.getPackages);
}

module.exports = {
    routes
}