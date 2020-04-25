const { query, param, body } = require('express-validator');

exports.validateInsertCostPackage = [
    body('name').isLength({ min: 1, max: 50 }).withMessage("Name should be at least 1 character and maximum 50 characters"),
    body('amount').isFloat({ min: 0 }).withMessage("Amount must be positive float")
]

exports.validateUpdateCostPackage = [
    param('id').isInt({ min: 1 }).withMessage("Id must be positive integer"),
    body('name').isLength({ min: 1, max: 50 }).withMessage("Name should be at least 1 character and maximum 50 characters"),
    body('amount').isFloat({ min: 0 }).withMessage("Amount must be positive float")
]

exports.validateGetCostPackage = [
    query('id').optional({ nullable: true }).isInt({ min: 1 }).withMessage("Id must be filled with integer greater than equal 0")
]

exports.validateDeleteCostPackage = [
    param('id').isInt({ min: 1 }).withMessage("Id must be positive integer")
]
