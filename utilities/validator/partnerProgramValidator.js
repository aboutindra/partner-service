const { query, param, body } = require('express-validator');
const moment = require('moment');
const dateValidator = require('./validateDateFormat');

exports.validateInsertPartnerProgram = [
    body('partnerCode').not().isEmpty().isLength({ max: 5 }).customSanitizer(value => {return value.toUpperCase()}).withMessage("Partner code must be maximum 5 characters"),
    body('exchangeRate').isInt({ gt: 0 }).withMessage("Exchange rate must be positive integer greater than 0"),
    body('minAmountPerTransaction').optional({ nullable: true }).isInt({ gt: 0 }).withMessage("Minimum amount per transaction must be positive integer greater than 0"),
    body('maxAmountPerTransaction').optional({ nullable: true }).isInt({ gt: 0 }).withMessage("Maximum amount per transaction must be positive integer greater than 0"),
    body('maxTransactionAmountPerDay').optional({ nullable: true }).isInt({ gt: 0 }).withMessage("Maximum transaction amount per day must be positive integer greater than 0"),
    body('maxTransactionAmountPerMonth').optional({ nullable: true }).isInt({ gt: 0 }).withMessage("Maximum transaction amount per month must be positive integer greater than 0"),
    body('startDate').not().isEmpty().custom(dateValidator.validateDate).withMessage("Start date must be in UTC, ISO-8601, or RFC 2822 format"),
    body('endDate').not().isEmpty().custom(dateValidator.validateDate).custom(dateValidator.validateDateRange)
    .withMessage("End date must be in UTC, ISO-8601, or RFC 2822 format and must be higher than start date")
]

exports.validateDeletePartnerProgram = [
    param('id').isInt({ min: 1 }).withMessage("Id must be greater than 0")
]

exports.validateGetPartnerProgram = [
    query('id').optional({ nullable: true }).isInt({ min: 1 }).withMessage("Id must be filled with integer greater than 0"),
    query('page').optional({ nullable: true }).isInt({ min: 1 }).withMessage("Page must be filled with integer greater than 0"),
    query('limit').optional({ nullable: true }).isInt({ min: 1 }).withMessage("Limit must be filled with integer greater than 0"),
]
