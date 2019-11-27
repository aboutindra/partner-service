const { param, body } = require('express-validator');
const moment = require('moment');

exports.validateInsert = [
    body('partnerCode').not().isEmpty().withMessage("Partner code can not be empty")
    .isLength({ max: 5 }).withMessage("Partner code must be maximum 5 characters"),
    body('exchangeRate').not().isEmpty().withMessage("Exchange rate can not be empty")
    .isInt({ gt: 0 }).withMessage("Exchange rate must be positive integer greater than 0"),
    body('minAmountPerTransaction').optional({ nullable: true }).isInt({ gt: 0 }).withMessage("Minimum amount per transaction must be positive integer greater than 0"),
    body('maxAmountPerTransaction').optional({ nullable: true }).isInt({ gt: 0 }).withMessage("Maximum amount per transaction must be positive integer greater than 0"),
    body('maxTransactionAmountPerDay').optional({ nullable: true }).isInt({ gt: 0 }).withMessage("Maximum transaction amount per day must be positive integer greater than 0"),
    body('maxTransactionAmountPerMonth').optional({ nullable: true }).isInt({ gt: 0 }).withMessage("Maximum transaction amount per month must be positive integer greater than 0"),
    body('startDate').custom(validateDate).withMessage("Start date must be in UTC, ISO-8601, or RFC 2822 format"),
    body('endDate').custom(validateDate).withMessage("End date must be in UTC, ISO-8601, or RFC 2822 format")
]

exports.validateDelete = [
    param('id').isInt().withMessage("Id must be positive integer")
]

function validateDate(dateString) {
    let date = moment(dateString);
    if (date.isValid()) {
        return true;
    } else {
        return false;
    }
}
