const { query, param, body } = require('express-validator');
const dateValidator = require('./dateFormatValidator');
const CaseFormatter = require('./caseFormatter');

exports.validateInsertPartnerProgram = [
    body('partnerCode').isLength({ min: 1, max: 5 }).customSanitizer(CaseFormatter.upperingCaseInput)
    .withMessage("Partner code should be at least 1 character and maximum 5 characters"),
    body('exchangeRate').isInt({ gt: 0 }).withMessage("Exchange rate must be positive integer greater than 0"),
    body('minAmountPerTransaction').optional({ nullable: true }).isInt({ gt: 0 }).withMessage("Minimum amount per transaction must be positive integer greater than 0"),
    body('maxAmountPerTransaction').optional({ nullable: true }).isInt({ gt: 0 }).withMessage("Maximum amount per transaction must be positive integer greater than 0"),
    body('maxTransactionAmountPerDay').optional({ nullable: true }).isInt({ gt: 0 }).withMessage("Maximum transaction amount per day must be positive integer greater than 0"),
    body('maxTransactionAmountPerMonth').optional({ nullable: true }).isInt({ gt: 0 }).withMessage("Maximum transaction amount per month must be positive integer greater than 0"),
    body('startDate').custom(dateValidator.validateDate).withMessage("Start date must be in UTC, ISO-8601, or RFC 2822 format"),
    body('endDate').custom(dateValidator.validateDate).custom(dateValidator.validateDateRange)
    .withMessage("End date must be in UTC, ISO-8601, or RFC 2822 format and must be higher than start date")
]

exports.validateDeletePartnerProgram = [
    param('id').isInt({ min: 1 }).withMessage("Id must be greater than 0")
]

exports.validateGetPartnerProgram = [
    query('id').optional({ nullable: true }).isInt({ min: 1 }).withMessage("Id must be filled with integer greater than 0")
]
