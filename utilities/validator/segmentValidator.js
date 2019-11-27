const { param, body } = require('express-validator');

exports.validateInsert = [
    body('name').not().isEmpty().withMessage("Name can not be empty")
]

exports.validateUpdate = [
    param('id').isInt().withMessage("Id must be positive integer"),
    body('name').not().isEmpty().withMessage("Name can not be empty")
]