const { body } = require('express-validator');
const CaseFormatter = require('./caseFormatter');

exports.validateInsertPartnerWallet = [
    body('partnerCode').isLength({ min: 1, max: 5 }).customSanitizer(CaseFormatter.upperingCaseInput).withMessage("Partner code can not be empty"),
    body('walletCode').not().isEmpty().withMessage("Wallet code can not be empty")
]
