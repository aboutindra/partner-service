const { query, body } = require('express-validator');
const dateValidator = require('./dateFormatValidator');
const CostType = require('../../enum/costType');

exports.validateInsertDiscount = [
    body('code').isLength({ min: 1, max: 10 }).withMessage("Code must be maximum 10 characters"),
    body('name').isLength({ min: 1, max: 50 }).not().isEmpty().withMessage("Name can not be empty"),
    body('discountType').isIn(CostType.getEnumValues()).withMessage("Discount type must be valid type"),
    body('amount').isInt({ min: 0 }).withMessage("Amount must be greater or equal than zero"),
    body('amount').if(body('discountType').equals(CostType.PERCENTAGE)).isInt({ min: 0, max: 100 }).withMessage("Discount can only be between 0 and 100"),
    body('startDate').custom(dateValidator.validateDate).withMessage("Start date must be in UTC, ISO-8601, or RFC 2822 format"),
    body('endDate').custom(dateValidator.validateDate).withMessage("End date must be in UTC, ISO-8601, or RFC 2822 format")
]
