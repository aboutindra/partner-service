const { param, body } = require('express-validator');

exports.validateInsertSegment = [
    body('name').not().isEmpty().withMessage("Name can not be empty")
]

exports.validateUpdateSegment = [
    param('id').isInt({ min: 0 }).withMessage("Id must be positive integer"),
    body('name').not().isEmpty().withMessage("Name can not be empty")
]
