const { query, param, body } = require('express-validator');

exports.validateInsertAcquirerPackage = [
    body('name').not().isEmpty().withMessage("Name can not be empty"),
    body('costType').not().isEmpty().isIn(['fixed', 'percentage', 'FIXED', 'PERCENTAGE']).withMessage("Cost type can only be fixed or percentage"),
    body('amount').not().isEmpty().isFloat({ min: 0 }).withMessage("Amount must be positive float")
]

exports.validateUpdateAcquirerPackage = [
    param('id').isInt().withMessage("Id must be positive integer"),
    body('name').not().isEmpty().withMessage("Name can not be empty"),
    body('costType').not().isEmpty().isIn(['fixed', 'percentage', 'FIXED', 'PERCENTAGE']).withMessage("Cost type can only be fixed or percentage"),
    body('amount').not().isEmpty().isFloat({ min: 0 }).withMessage("Amount must be positive integer")
]

exports.validateGetAcquirerPackage = [
    query('id').optional({ nullable: true }).isInt({ min: 0 }).withMessage("Id must be filled with integer greater than equal 0")
]

exports.validateDeleteAcquirerPackage = [
    param('id').isInt({ min: 0 }).withMessage("Id must be positive integer")
]
