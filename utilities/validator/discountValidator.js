const { query, body } = require('express-validator');
const moment = require('moment');

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
    body('startDate').custom(validateDate).withMessage("Start date must be in UTC, ISO-8601, or RFC 2822 format"),
    body('endDate').custom(validateDate).withMessage("End date must be in UTC, ISO-8601, or RFC 2822 format")
]

exports.validateGetDiscount = [
    query('page').optional({ nullable: true }).isInt({ min: 1 }).withMessage("Page must be filled with integer greater than 0"),
    query('limit').optional({ nullable: true }).isInt({ min: 1 }).withMessage("Limit must be filled with integer greater than 0"),
]

function validateDate(dateString) {
    let date = moment(dateString);
    if (date.isValid()) {
        return true;
    } else {
        return false;
    }
}
