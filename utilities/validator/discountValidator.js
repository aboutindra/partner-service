const { body, param } = require('express-validator');
const dateValidator = require('./dateFormatValidator');
const CaseFormatter = require('./caseFormatter');

exports.validateInsertDiscount = [
    body('code').isLength({ min: 1, max: 10 }).customSanitizer(CaseFormatter.upperingCaseInput).withMessage("Code must be maximum 10 characters"),
    body('partnerCode').isLength({ min: 1, max: 5 }).customSanitizer(CaseFormatter.upperingCaseInput).withMessage("Partner code can not be empty"),
    body('name').isLength({ min: 1, max: 255 }).withMessage("Name can not be empty"),
    body('amount').isInt({ min: 0, max: 100 }).withMessage("Discount can only be between 0 and 100 percent"),
    body('startDate').custom(dateValidator.validateDate).withMessage("Start date must be in UTC, ISO-8601, or RFC 2822 format"),
    body('endDate').custom(dateValidator.validateDate).withMessage("End date must be in UTC, ISO-8601, or RFC 2822 format")
]

exports.validateDiscountCode = [
    param('code').isLength({ min: 1, max: 10 }).customSanitizer(CaseFormatter.upperingCaseInput).withMessage("Code must be maximum 10 characters")
]

exports.validatePartnerCode = [
    param('partnerCode').isLength({ min: 1, max: 5 }).customSanitizer(CaseFormatter.upperingCaseInput).withMessage("Partner code can not be empty")
]
