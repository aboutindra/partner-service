const { query, param, body } = require('express-validator');

exports.validateInsertIssuerPackage = [
    body('name').not().isEmpty().withMessage("Name can not be empty"),
    body('costType').not().isEmpty().isIn(['fixed', 'percentage', 'FIXED', 'PERCENTAGE']).withMessage("Cost type can only be fixed or percentage"),
    body('amount').not().isEmpty().isFloat({ min: 0 }).withMessage("Amount must be positive float")
]

exports.validateUpdateIssuerPackage = [
    param('id').isInt().withMessage("Id must be positive integer"),
    body('name').not().isEmpty().withMessage("Name can not be empty"),
    body('costType').not().isEmpty().isIn(['fixed', 'percentage', 'FIXED', 'PERCENTAGE']).withMessage("Cost type can only be fixed or percentage"),
    body('amount').not().isEmpty().isFloat({ min: 0 }).withMessage("Amount must be positive integer")
]

exports.validateGetIssuerPackage = [
    query('id').optional({ nullable: true }).isInt({ min: 0 }).withMessage("Id must be filled with integer greater than equal 0")
]

exports.validateDeleteIssuerPackage = [
    param('id').isInt({ min: 0 }).withMessage("Id must be positive integer")
]
