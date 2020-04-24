const { body } = require('express-validator');

exports.validateInsertPartnerQuota = [
    body("partnerCode").not().isEmpty().withMessage("Partner code can not be empty"),
    body("remainingQuotaPerDay").optional({ nullable: true }).isInt({ gt: 0 }).withMessage("Daily quota reduction must be positive integer greater than 0"),
    body("remainingQuotaPerMonth").optional({ nullable: true }).isInt({ gt: 0 }).withMessage("Monthly quota reduction must be positive integer greater than 0")
]

exports.validateDeductionPartnerQuota = [
    body("dailyQuotaDeduction").optional({ nullable: true }).isInt({ gt: 0 }).withMessage("Daily quota deduction must be positive integer greater than 0"),
    body("monthlyQuotaDeduction").optional({ nullable: true }).isInt({ gt: 0 }).withMessage("Monthly quota deduction must be positive integer greater than 0"),
    body("monthlyQuotaDeduction").if(body("dailyQuotaDeduction").isEmpty()).not().isEmpty().withMessage("Daily quota deduction or monthly quota deduction must be filled")
]
