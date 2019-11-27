const { param, body } = require('express-validator');

exports.validateInsert = [
    body('code').not().isEmpty().withMessage("Code can not be empty"),
    body('name').not().isEmpty().withMessage("Name can not be empty"),
    body('isAcquirer').not().isEmpty().withMessage("Acquirer status can not be empty")
    .isBoolean().withMessage("Acquirer status must be boolean"),
    body('isIssuer').not().isEmpty().withMessage("Issuer status cannot be emtpy")
    .isBoolean().withMessage("Issuer status must be boolean"),
    body('issuerCostPackageId').if(body('isIssuer').isIn([true])).not().isEmpty().withMessage("Issuer cost package id is required if issuer status is true"),
    body('acquirerCostPackageId').if(body('isAcquirer').isIn([true])).not().isEmpty().withMessage("Acquirer cost package id is required if acquirer status is true"),
    body('segmentId').not().isEmpty().withMessage("Segment id can not be empty"),
    body('logo').not().isEmpty().withMessage("Logo can not be empty"),
    body('unit').not().isEmpty().withMessage("Unit can not be empty")
]

exports.validateUpdate = [
    body('name').not().isEmpty().withMessage("Name can not be empty"),
    body('isAcquirer').not().isEmpty().withMessage("Acquirer status can not be empty")
    .isBoolean().withMessage("Acquirer status must be boolean"),
    body('isIssuer').not().isEmpty().withMessage("Issuer status cannot be emtpy")
    .isBoolean().withMessage("Issuer status must be boolean"),
    body('issuerCostPackageId').if(body('isIssuer').isIn([true])).not().isEmpty().withMessage("Issuer cost package id is required if issuer status is true"),
    body('acquirerCostPackageId').if(body('isAcquirer').isIn([true])).not().isEmpty().withMessage("Acquirer cost package id is required if acquirer status is true"),
    body('segmentId').not().isEmpty().withMessage("Segment id can not be empty"),
    body('logo').not().isEmpty().withMessage("Logo can not be empty"),
    body('unit').not().isEmpty().withMessage("Unit can not be empty")
]
