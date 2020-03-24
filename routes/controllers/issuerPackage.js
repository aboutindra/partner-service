const packageHandler = require('../../core/issuerPackage');
const validator = require('../../utilities/validator/issuerPackageValidator');
const paginationValidator = require('../../utilities/validator/paginationValidator');

const routes = (server) => {
    server.post('/api/v1/packages/issuers', [validator.validateInsertIssuerPackage], packageHandler.insertIssuerPackage);
    server.put('/api/v1/packages/issuers/:id', [validator.validateUpdateIssuerPackage], packageHandler.updateIssuerPackage);
    server.delete('/api/v1/packages/issuers/:id', [validator.validateDeleteIssuerPackage], packageHandler.deleteIssuerPackage);
    server.get('/api/v1/packages/issuers', [validator.validateGetIssuerPackage, paginationValidator], packageHandler.getIssuerPackages);
}

module.exports = {
    routes
}
