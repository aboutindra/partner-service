const { query, param, body } = require('express-validator');

exports.validateInsert = [
    body('name').not().isEmpty().withMessage("Name can not be empty"),
    body('costType').not().isEmpty().withMessage("Cost type can not be empty")
    .isIn(['fixed', 'percentage', 'FIXED', 'PERCENTAGE']).withMessage("Cost type can only be fixed or percentage"),
    body('amount').not().isEmpty().withMessage("Amount can not be empty")
    .isFloat({ min: 0 }).withMessage("Amount must be positive integer")
]

exports.validateUpdate = [
    param('id').isInt().withMessage("Id must be positive integer"),
    body('name').not().isEmpty().withMessage("Name can not be empty"),
    body('costType').not().isEmpty().withMessage("Cost type can not be empty")
    .isIn(['fixed', 'percentage', 'FIXED', 'PERCENTAGE']).withMessage("Cost type can only be fixed or percentage"),
    body('amount').not().isEmpty().withMessage("Amount can not be empty")
    .isFloat({ min: 0 }).withMessage("Amount must be positive integer")
]

exports.validateGet = [
    query('page').optional({ nullable: true }).isInt({ min: 1 }).withMessage("Page must be filled with integer greater than 0"),
    query('limit').optional({ nullable: true }).isInt({ min: 1 }).withMessage("Limit must be filled with integer greater than 0"),
]

exports.validateDelete = [
    param('id').isInt().withMessage("Id must be positive integer")
]