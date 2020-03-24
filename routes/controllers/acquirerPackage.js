const packageHandler = require('../../core/acquirerPackage');
const validator = require('../../utilities/validator/acquirerPackageValidator');

const routes = (server) => {
    server.post('/api/v1/packages/acquirers', [validator.validateInsertAcquirerPackage], packageHandler.insertAcquirerPackage);
    server.put('/api/v1/packages/acquirers/:id', [validator.validateUpdateAcquirerPackage], packageHandler.updateAcquirerPackage);
    server.delete('/api/v1/packages/acquirers/:id', [validator.validateDeleteAcquirerPackage], packageHandler.deleteAcquirerPackage);
    server.get('/api/v1/packages/acquirers', [validator.validateGetAcquirerPackage], packageHandler.getAcquirerPackages);
}

module.exports = {
    routes
}
