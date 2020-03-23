const { body } = require('express-validator');


exports.validateInsertPartnerWallet = [
    body("partnerCode").not().isEmpty().withMessage("Partner code can not be empty"),
    body('walletCode').not().isEmpty().withMessage("Wallet code can not be empty")
]
