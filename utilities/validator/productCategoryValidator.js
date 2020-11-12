const { param, body } = require('express-validator');

exports.validateInsertProductCategory = [
    body('name').isLength({ min: 1, max: 25 }).withMessage("Name should be at least 1 character and maximum 25 character")
]

exports.validateUpdateProductCategory = [
    param('id').isInt({ min: 0 }).withMessage("Id must be positive integer"),
    body('name').isLength({ min: 1, max: 25 }).withMessage("Name should be at least 1 character and maximum 25 character"),
    body('isDeleted').isBoolean().withMessage("Is deleted should be boolean")
]

exports.validateDeleteProductCategory = [
    param('id').isInt({ min: 0 }).withMessage("Id must be positive integer")
]
