const packageHandler = require('../../core/costPackage');
const validator = require('../../utilities/validator/costPackageValidator');
const paginationValidator = require('../../utilities/validator/paginationValidator');

const routes = (server) => {
    server.post('/api/v1/packages', [validator.validateInsertCostPackage], packageHandler.insertCostPackage);
    server.put('/api/v1/packages/:id', [validator.validateUpdateCostPackage], packageHandler.updateCostPackage);
    server.delete('/api/v1/packages/:id', [validator.validateDeleteCostPackage], packageHandler.deleteCostPackage);
    server.get('/api/v1/packages', [validator.validateGetCostPackage, paginationValidator], packageHandler.getCostPackages);
}

module.exports = {
    routes
}
