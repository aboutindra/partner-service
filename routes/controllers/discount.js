const discountHandler = require('../../core/discount');
const validator = require('../../utilities/validator/discountValidator');
const paginationValidator = require('../../utilities/validator/paginationValidator');

const routes = (server) => {
    server.post('/api/v1/discounts', [validator.validateInsertDiscount], discountHandler.insertDiscount);
    server.delete('/api/v1/discounts/:code', [validator.validateDiscountCode], discountHandler.deleteDiscount);
    server.get('/api/v1/discounts', [paginationValidator], discountHandler.getDiscounts);
    server.get('/api/v1/active-discount/:partnerCode', [validator.validatePartnerCode], discountHandler.getActiveDiscounts);
}

module.exports = {
    routes
};
