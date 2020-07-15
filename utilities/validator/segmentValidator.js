const { param, body } = require('express-validator');

exports.validateInsertSegment = [
    body('name').isLength({ min: 1, max: 25 }).withMessage("Name should be at least 1 character and maximum 25 character")
]

exports.validateUpdateSegment = [
    param('id').isInt({ min: 0 }).withMessage("Id must be positive integer"),
    body('name').isLength({ min: 1, max: 25 }).withMessage("Name should be at least 1 character and maximum 25 character")
]
