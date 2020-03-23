const packageHandler = require('../../core/issuerPackage');
const validator = require('../../utilities/validator/issuerPackageValidator');

const routes = (server) => {
    server.post('/api/v1/packages/issuers', [validator.validateInsertIssuerPackage], packageHandler.insertPackage);
    server.put('/api/v1/packages/issuers/:id', [validator.validateUpdateIssuerPackage], packageHandler.updatePackage);
    server.delete('/api/v1/packages/issuers/:id', [validator.validateDeleteIssuerPackage], packageHandler.deletePackage);
    server.get('/api/v1/packages/issuers', [validator.validateGetIssuerPackage], packageHandler.getPackages);
}

module.exports = {
    routes
}
