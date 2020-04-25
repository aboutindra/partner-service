const { body } = require('express-validator');
const CaseFormatter = require('./caseFormatter');

exports.validateInsertPartnerQuota = [
    body('partnerCode').isLength({ min: 1, max: 5 }).customSanitizer(CaseFormatter.upperingCaseInput)
    .withMessage("Partner code should be at least 1 character and maximum 5 characters"),
    body("remainingQuotaPerDay").optional({ nullable: true }).isInt({ gt: 0 }).withMessage("Daily quota reduction must be positive integer greater than 0"),
    body("remainingQuotaPerMonth").optional({ nullable: true }).isInt({ gt: 0 }).withMessage("Monthly quota reduction must be positive integer greater than 0")
]

exports.validateDeductionPartnerQuota = [
    body("dailyQuotaDeduction").optional({ nullable: true }).isInt({ gt: 0 }).withMessage("Daily quota deduction must be positive integer greater than 0"),
    body("monthlyQuotaDeduction").optional({ nullable: true }).isInt({ gt: 0 }).withMessage("Monthly quota deduction must be positive integer greater than 0"),
    body("monthlyQuotaDeduction").if(body("dailyQuotaDeduction").isEmpty()).not().isEmpty().withMessage("Daily quota deduction or monthly quota deduction must be filled")
]
