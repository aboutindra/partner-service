const { query, param, body } = require('express-validator');
const CostType = require('../../enum/costType');
const CostBearerType = require('../../enum/costBearerType');
const loweringCaseInput = require('./enumCaseFormatter').LoweringCaseInput;

exports.validateInsertCostPackage = [
    body('name').not().isEmpty().withMessage("Name can not be empty"),
    body('amount').isFloat({ min: 0 }).withMessage("Amount must be positive float")
]

exports.validateUpdateCostPackage = [
    param('id').isInt().withMessage("Id must be positive integer"),
    body('name').not().isEmpty().withMessage("Name can not be empty"),
    body('amount').isFloat({ min: 0 }).withMessage("Amount must be positive float")
]

exports.validateGetCostPackage = [
    query('id').optional({ nullable: true }).isInt({ min: 0 }).withMessage("Id must be filled with integer greater than equal 0")
]

exports.validateDeleteCostPackage = [
    param('id').isInt({ min: 0 }).withMessage("Id must be positive integer")
]
