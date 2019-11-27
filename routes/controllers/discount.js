const discountHandler = require('../../core/discount');
const validator = require('../../utilities/validator/discountValidator');

const routes = (server) => {
    server.post('/api/v1/discounts', [validator.validateInsert], discountHandler.insertDiscount);
    server.delete('/api/v1/discounts/:code', [], discountHandler.deleteDiscount);
    server.get('/api/v1/discounts', [], discountHandler.getDiscounts);
    server.get('/api/v1/active-discounts', [], discountHandler.getActiveDiscounts);
}

module.exports = {
    routes
};
