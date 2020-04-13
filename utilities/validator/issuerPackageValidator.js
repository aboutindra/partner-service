const { query, param, body } = require('express-validator');
const CostType = require('../../enum/costType');
const CostBearerType = require('../../enum/costBearerType');
const loweringCaseInput = require('./enumCaseFormatter').LoweringCaseInput;

exports.validateInsertIssuerPackage = [
    body('name').not().isEmpty().withMessage("Name can not be empty"),
    body('costType').customSanitizer(loweringCaseInput).isIn(CostType.getEnumValues()).withMessage("Cost type must be valid value"),
    body('costBearerType').customSanitizer(loweringCaseInput).isIn(CostBearerType.getEnumValues()).withMessage("Cost bearer type must be valid value"),
    body('amount').isFloat({ min: 0 }).withMessage("Amount must be positive float")
]

exports.validateUpdateIssuerPackage = [
    param('id').isInt().withMessage("Id must be positive integer"),
    body('name').not().isEmpty().withMessage("Name can not be empty"),
    body('costType').customSanitizer(loweringCaseInput).isIn(CostType.getEnumValues()).withMessage("Cost type must be valid value"),
    body('costBearerType').customSanitizer(loweringCaseInput).isIn(CostBearerType.getEnumValues()).withMessage("Cost bearer type must be valid value"),
    body('amount').isFloat({ min: 0 }).withMessage("Amount must be positive float")
]

exports.validateGetIssuerPackage = [
    query('id').optional({ nullable: true }).isInt({ min: 0 }).withMessage("Id must be filled with integer greater than equal 0")
]

exports.validateDeleteIssuerPackage = [
    param('id').isInt({ min: 0 }).withMessage("Id must be positive integer")
]
