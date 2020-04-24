const { body } = require('express-validator');

exports.validateInsertPartner = [
    body('code').not().isEmpty().withMessage("Code can not be empty"),
    body('name').not().isEmpty().withMessage("Name can not be empty"),
    body('segmentId').not().isEmpty().withMessage("Segment id can not be empty"),
    body('costPackageId').not().isEmpty().withMessage("Cost package id can not be empty"),
    body('isAcquirer').not().isEmpty().withMessage("Acquirer status can not be empty"),
    body('isIssuer').not().isEmpty().withMessage("Issuer status can not be empty"),
    body('urlLogo').not().isEmpty().withMessage("Url logo can not be empty"),
    body('unit').not().isEmpty().withMessage("Unit can not be empty")
]

exports.validateUpdatePartner = [
    body('name').not().isEmpty().withMessage("Name can not be empty"),
    body('segmentId').not().isEmpty().withMessage("Segment id can not be empty"),
    body('costPackageId').not().isEmpty().withMessage("Cost package id can not be empty"),
    body('isAcquirer').not().isEmpty().withMessage("Acquirer status can not be empty"),
    body('isIssuer').not().isEmpty().withMessage("Issuer status can not be empty"),
    body('urlLogo').not().isEmpty().withMessage("Url logo can not be empty"),
    body('unit').not().isEmpty().withMessage("Unit can not be empty")
]
