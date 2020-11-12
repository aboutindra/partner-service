const productCategoryHandler = require('../../core/productCategory');
const validator = require('../../utilities/validator/productCategoryValidator');
const inputValidator = require('../../utilities/validator/inputValidator');

const routes = (server) => {
    server.post('/api/v1/product-categories', [validator.validateInsertPartnerCategory, inputValidator], productCategoryHandler.insertProductCategory);
    server.put('/api/v1/product-categories/:id', [validator.validateUpdatePartnerCategory, inputValidator], productCategoryHandler.updateProductCategory);
    server.delete('/api/v1/product-categories/:id', [validator.validateDeletePartnerCategory, inputValidator], productCategoryHandler.deleteProductCategory);
    server.get('/api/v1/product-categories', [], productCategoryHandler.getProductCategory);
}

module.exports = {
    routes
}
