const { param, body, query } = require('express-validator');

exports.validateInsertProductCategory = [
    body('name').isLength({ min: 1, max: 25 }).withMessage("Name should be at least 1 character and maximum 25 character"),
    body('imageUrl').isLength({ min: 1, max: 255 }).withMessage("Image url must be at least 1 character and maximum 255 characters")
]

exports.validateUpdateProductCategory = [
    param('id').isInt({ min: 1 }).withMessage("Id must be positive integer"),
    body('name').isLength({ min: 1, max: 25 }).withMessage("Name should be at least 1 character and maximum 25 character"),
    body('imageUrl').isLength({ min: 1, max: 255 }).withMessage("Image url must be at least 1 character and maximum 255 characters"),
    body('isDeleted').isBoolean().withMessage("Is deleted should be boolean")
]

exports.validateDeleteProductCategory = [
    param('id').isInt({ min: 1 }).withMessage("Id must be positive integer")
]

exports.validateGetProductCategory = [
    query('id').optional({ nullable: true }).isInt({ min: 1 }).withMessage("Id must be positive integer")
]
