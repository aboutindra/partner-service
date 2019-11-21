const discountHandler = require('../../core/discount');

const routes = (server) => {
    server.post('/api/v1/discounts', [], discountHandler.insertDiscount);
    server.delete('/api/v1/discounts/:code', [], discountHandler.softDeleteDiscount);
    server.get('/api/v1/discounts', [], discountHandler.getDiscounts);
    server.get('/api/v1/active-discounts', [], discountHandler.getActiveDiscounts);
}

module.exports = {
    routes
};
