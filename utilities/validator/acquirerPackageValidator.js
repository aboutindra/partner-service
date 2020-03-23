const { query, param, body } = require('express-validator');

exports.validateInsert = [
    body('name').not().isEmpty().withMessage("Name can not be empty"),
    body('costType').not().isEmpty().isIn(['fixed', 'percentage', 'FIXED', 'PERCENTAGE']).withMessage("Cost type can only be fixed or percentage"),
    body('amount').not().isEmpty().isFloat({ min: 0 }).withMessage("Amount must be positive float")
]

exports.validateUpdate = [
    param('id').isInt().withMessage("Id must be positive integer"),
    body('name').not().isEmpty().withMessage("Name can not be empty"),
    body('costType').not().isEmpty().isIn(['fixed', 'percentage', 'FIXED', 'PERCENTAGE']).withMessage("Cost type can only be fixed or percentage"),
    body('amount').not().isEmpty().isFloat({ min: 0 }).withMessage("Amount must be positive integer")
]

exports.validateGet = [
    query('id').optional({ nullable: true }).isInt({ min: 0 }).withMessage("Id must be filled with integer greater than equal 0"),
    query('page').optional({ nullable: true }).isInt({ min: 1 }).withMessage("Page must be filled with integer greater than 0"),
    query('limit').optional({ nullable: true }).isInt({ min: 1 }).withMessage("Limit must be filled with integer greater than 0"),
]

exports.validateDelete = [
    param('id').isInt({ min: 0 }).withMessage("Id must be positive integer")
]
