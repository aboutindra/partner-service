const productHandler = require('../../core/product');
const validator = require('../../utilities/validator/productValidator');
const inputValidator = require('../../utilities/validator/inputValidator');

const routes = (server) => {
    server.post('/api/v1/products', [validator.validateInsertProduct, inputValidator], productHandler.insertProduct);
    server.put('/api/v1/products/:code', [validator.validateUpdateProduct, inputValidator], productHandler.updateProduct);
    server.delete('/api/v1/products/:code', [validator.validateDeleteProduct, inputValidator], productHandler.deleteProduct);
    server.get('/api/v1/products', [inputValidator], productHandler.getProducts);
}

module.exports = {
    routes
}
