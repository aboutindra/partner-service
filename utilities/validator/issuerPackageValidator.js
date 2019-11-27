const { param, body } = require('express-validator');

exports.validateInsert = [
    body('name').not().isEmpty().withMessage("Name can not be empty"),
    body('costType').not().isEmpty().withMessage("Cost type can not be empty")
    .isIn(['fixed', 'percentage']).withMessage("Cost type can only be fixed or percentage"),
    body('amount').not().isEmpty().withMessage("Amount can not be empty")
    .isFloat({ min: 0 }).withMessage("Amount must be positive float")
]

exports.validateUpdate = [
    param('id').isInt().withMessage("Id must be positive integer"),
    body('name').not().isEmpty().withMessage("Name can not be empty"),
    body('costType').not().isEmpty().withMessage("Cost type can not be empty")
    .isIn(['fixed', 'percentage']).withMessage("Cost type can only be fixed or percentage"),
    body('amount').not().isEmpty().withMessage("Amount can not be empty")
    .isFloat({ min: 0 }).withMessage("Amount must be positive integer")
]

exports.validateDelete = [
    param('id').isInt().withMessage("Id must be positive integer")
]