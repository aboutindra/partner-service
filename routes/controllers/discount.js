const discountHandler = require('../../core/discount');
const validator = require('../../utilities/validator/discountValidator');

const routes = (server) => {
    server.post('/api/v1/discounts', [validator.validateInsertDiscount], discountHandler.insertDiscount);
    server.delete('/api/v1/discounts/:code', [], discountHandler.deleteDiscount);
    server.get('/api/v1/discounts', [validator.validateGetDiscount], discountHandler.getDiscounts);
    server.get('/api/v1/active-discount', [], discountHandler.getActiveDiscounts);
}

module.exports = {
    routes
};
