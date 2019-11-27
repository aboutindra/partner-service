const packageHandler = require('../../core/acquirerPackage');
const validator = require('../../utilities/validator/acquirerPackageValidator');

const routes = (server) => {
    server.post('/api/v1/packages/acquirers', [validator.validateInsert], packageHandler.insertPackage);
    server.put('/api/v1/packages/acquirers/:id', [validator.validateUpdate], packageHandler.updatePackage);
    server.delete('/api/v1/packages/acquirers/:id', [validator.validateDelete], packageHandler.deletePackage);
    server.get('/api/v1/packages/acquirers', [], packageHandler.getPackages);
}

module.exports = {
    routes
}