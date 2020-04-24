const { body } = require('express-validator');
const CaseFormatter = require('./caseFormatter');

exports.validateInsertPartner = [
    body('code').isLength({ min: 1, max: 5 }).customSanitizer(CaseFormatter.upperingCaseInput).withMessage("Code must be maximum 5 characters"),
    body('name').isLength({ min: 1, max: 255 }).withMessage("Name can not be empty"),
    body('segmentId').isInt({ min: 1 }).withMessage("Segment id can not be empty"),
    body('costPackageId').isInt({ min: 1 }).withMessage("Cost package id can not be empty"),
    body('isAcquirer').isBoolean().withMessage("Acquirer status can not be empty"),
    body('isIssuer').isBoolean().withMessage("Issuer status can not be empty"),
    body('urlLogo').isLength({ min: 1, max: 255 }).withMessage("Url logo can not be empty"),
    body('unit').isLength({ min: 1, max: 50 }).withMessage("Unit can not be empty")
]

exports.validateUpdatePartner = [
    body('name').isLength({ min: 1, max: 255 }).withMessage("Name can not be empty"),
    body('segmentId').isInt({ min: 1 }).withMessage("Segment id can not be empty"),
    body('costPackageId').isInt({ min: 1 }).withMessage("Cost package id can not be empty"),
    body('isAcquirer').isBoolean().withMessage("Acquirer status can not be empty"),
    body('isIssuer').isBoolean().withMessage("Issuer status can not be empty"),
    body('urlLogo').isLength({ min: 1, max: 255 }).withMessage("Url logo can not be empty"),
    body('unit').isLength({ min: 1, max: 50 }).withMessage("Unit can not be empty")
]
