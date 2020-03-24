const { query, body } = require('express-validator');
const dateValidator = require('./dateFormatValidator');

exports.validateInsertDiscount = [
    body('code').not().isEmpty().isLength({ max: 10 }).withMessage("Code must be maximum 10 characters"),
    body('name').not().isEmpty().withMessage("Name can not be empty"),
    body('deductionDiscountType').optional({ nullable: true }).isIn(['fixed', 'percentage']).withMessage("Discount type can only be fixed or percentage"),
    body('deductionDiscountAmount').if(body('deductionDiscountType').not().isEmpty()).not().isEmpty()
    .withMessage("Deduction discount amount is required if deduction discount type is not empty")
    .isFloat({ min: 0 }).withMessage("Deduction discount amount must be positive float"),
    body('additionDiscountType').optional({ nullable: true }).isIn(['fixed', 'percentage']).withMessage("Discount type can only be fixed or percentage"),
    body('additionDiscountAmount').if(body('additionDiscountType').not().isEmpty()).not().isEmpty()
    .withMessage("Addition discount amount is required if deduction discount type is not empty")
    .isFloat({ min: 0 }).withMessage("Addition discount amount must be positive float"),
    body('deductionDiscountType').if(body('additionDiscountType').isEmpty()).not().isEmpty().withMessage("Deduction discount or addition discount must be filled"),
    body('startDate').custom(dateValidator.validateDate).withMessage("Start date must be in UTC, ISO-8601, or RFC 2822 format"),
    body('endDate').custom(dateValidator.validateDate).withMessage("End date must be in UTC, ISO-8601, or RFC 2822 format")
]

