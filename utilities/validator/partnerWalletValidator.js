const { body } = require('express-validator');
const CaseFormatter = require('./caseFormatter');

exports.validateInsertPartnerWallet = [
    body('partnerCode').isLength({ min: 1, max: 5 }).customSanitizer(CaseFormatter.upperingCaseInput)
    .withMessage("Partner code should be at least 1 character and maximum 5 characters"),
    body('walletCode').isLength({ min: 1, max: 15 }).withMessage("Wallet code should be at least 1 numeric character and maximum 15 numeric character")
]
