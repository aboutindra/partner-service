const packageHandler = require('../../core/acquirerPackage');
const validator = require('../../utilities/validator/acquirerPackageValidator');

const routes = (server) => {
    server.post('/api/v1/packages/acquirers', [validator.validateInsertAcquirerPackage], packageHandler.insertPackage);
    server.put('/api/v1/packages/acquirers/:id', [validator.validateUpdateAcquirerPackage], packageHandler.updatePackage);
    server.delete('/api/v1/packages/acquirers/:id', [validator.validateDeleteAcquirerPackage], packageHandler.deletePackage);
    server.get('/api/v1/packages/acquirers', [validator.validateGetAcquirerPackage], packageHandler.getPackages);
}

module.exports = {
    routes
}
