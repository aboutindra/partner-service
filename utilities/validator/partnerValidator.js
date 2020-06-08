const { body, param, query } = require('express-validator');
const CaseFormatter = require('./caseFormatter');
const CostBearerType = require('../../enum/costBearerType');

exports.validateInsertPartner = [
    body('code').isLength({ min: 1, max: 5 }).customSanitizer(CaseFormatter.upperingCaseInput)
    .withMessage("Code should be at least 1 character and maximum 5 characters"),
    body('name').isLength({ min: 1, max: 50 }).withMessage("Name should be at least 1 character and maximum 50 characters"),
    body('segmentId').isInt({ min: 1 }).withMessage("Segment id can not be empty"),
    body('costPackageId').isInt({ min: 1 }).withMessage("Cost package id can not be empty"),
    body('isAcquirer').isBoolean().withMessage("Acquirer status can not be empty"),
    body('isIssuer').isBoolean().withMessage("Issuer status can not be empty"),
    body('costBearerType').customSanitizer(CaseFormatter.loweringCaseInput).isIn(CostBearerType.getEnumValues())
    .withMessage("Cost bearer type must be valid type"),
    body('urlLogo').isLength({ min: 1, max: 255 }).withMessage("Url logo should be at least 1 character and maximum 255 characters"),
    body('unit').isLength({ min: 1, max: 25 }).withMessage("Unit should be at least 1 character and maximum 25 characters")
]

exports.validateUpdatePartner = [
    param('code').isLength({ min: 1, max: 5 }).customSanitizer(CaseFormatter.upperingCaseInput)
    .withMessage("Code should be at least 1 character and maximum 5 characters"),
    body('name').isLength({ min: 1, max: 50 }).withMessage("Name should be at least 1 character and maximum 50 characters"),
    body('segmentId').isInt({ min: 1 }).withMessage("Segment id can not be empty"),
    body('costPackageId').isInt({ min: 1 }).withMessage("Cost package id can not be empty"),
    body('isAcquirer').isBoolean().withMessage("Acquirer status can not be empty"),
    body('isIssuer').isBoolean().withMessage("Issuer status can not be empty"),
    body('costBearerType').customSanitizer(CaseFormatter.loweringCaseInput).isIn(CostBearerType.getEnumValues())
    .withMessage("Cost bearer type must be valid type"),
    body('urlLogo').isLength({ min: 1, max: 255 }).withMessage("Url logo should be at least 1 character and maximum 255 characters"),
    body('unit').isLength({ min: 1, max: 25 }).withMessage("Unit should be at least 1 character and maximum 25 characters")
]

exports.validateGetPartner = [
    query('code').optional({ nullable: true }).isLength({ min: 1, max: 5 }).customSanitizer(CaseFormatter.upperingCaseInput)
    .withMessage("Code should be at least 1 character and maximum 5 characters")
]