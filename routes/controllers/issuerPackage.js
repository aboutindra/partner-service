const packageHandler = require('../../core/issuerPackage');
const validator = require('../../utilities/validator/acquirerPackageValidator');

const routes = (server) => {
    server.post('/api/v1/packages/issuers', [validator.validateInsert], packageHandler.insertPackage);
    server.put('/api/v1/packages/issuers/:id', [validator.validateUpdate], packageHandler.updatePackage);
    server.delete('/api/v1/packages/issuers/:id', [validator.validateDelete], packageHandler.deletePackage);
    server.get('/api/v1/packages/issuers', [validator.validateGet], packageHandler.getPackages);
}

module.exports = {
    routes
}