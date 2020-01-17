const { query, param, body } = require('express-validator');
const moment = require('moment');

exports.validateInsert = [
    body('partnerCode').not().isEmpty().isLength({ max: 5 }).withMessage("Partner code must be maximum 5 characters"),
    body('exchangeRate').isInt({ gt: 0 }).withMessage("Exchange rate must be positive integer greater than 0"),
    body('minAmountPerTransaction').optional({ nullable: true }).isInt({ gt: 0 }).withMessage("Minimum amount per transaction must be positive integer greater than 0"),
    body('maxAmountPerTransaction').optional({ nullable: true }).isInt({ gt: 0 }).withMessage("Maximum amount per transaction must be positive integer greater than 0"),
    body('maxTransactionAmountPerDay').optional({ nullable: true }).isInt({ gt: 0 }).withMessage("Maximum transaction amount per day must be positive integer greater than 0"),
    body('maxTransactionAmountPerMonth').optional({ nullable: true }).isInt({ gt: 0 }).withMessage("Maximum transaction amount per month must be positive integer greater than 0"),
    body('startDate').custom(validateDate).withMessage("Start date must be in UTC, ISO-8601, or RFC 2822 format"),
    body('endDate').custom(validateDate).withMessage("End date must be in UTC, ISO-8601, or RFC 2822 format")
]

exports.validateDelete = [
    param('id').isInt({ min: 1 }).withMessage("Id must be greater than 0")
]

exports.validateGet = [
    query('id').optional({ nullable: true }).isInt({ min: 1 }).withMessage("Id must be filled with integer greater than 0"),
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
