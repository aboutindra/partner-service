const { param, query, body } = require('express-validator');
const dateValidator = require('./dateFormatValidator');
const CaseFormatter = require('./caseFormatter');

exports.validateInsertProduct = [
    body('code').isLength({ min: 1, max: 25 }).customSanitizer(CaseFormatter.upperingCaseInput)
    .withMessage("Code must be at least 1 character and maximum 25 character"),
    body('name').isLength({ min: 1, max: 50 }).withMessage("Name must be at least 1 character and maximum 50 character"),
    body('categoryId').isInt({ min: 1 }).withMessage("Category id must be filled"),
    body('description').optional({nullable: true}).isLength({min: 5}).withMessage("Description must be at least 5 characters"),
    body('termCondition').optional({nullable: true}).isLength({min: 5}).withMessage("Term and condition  must be at least 5 characters"),
    body('imageUrl').isLength({ min: 1, max: 255 }).withMessage("Image url must be at least 1 character and maximum 255 characters"),
    body('nominal').optional({nullable: true}).isInt({min: 0}).withMessage("Nominal must be greater than equal zero"),
    body('startDate').optional({nullable: true}).custom(dateValidator.validateDate).withMessage("Start date must be in UTC, ISO-8601, or RFC 2822 format"),
    body('endDate').optional({nullable: true}).custom(dateValidator.validateDate).custom(dateValidator.validateDateRange)
    .withMessage("End date must be in UTC, ISO-8601, or RFC 2822 format and must be higher than start date")
]

exports.validateUpdateProduct = [
    param('code').isLength({ min: 1, max: 25 }).customSanitizer(CaseFormatter.upperingCaseInput)
    .withMessage("Code must be at least 1 character and maximum 25 character"),
    body('name').isLength({ min: 1, max: 50 }).withMessage("Name must be at least 1 character and maximum 50 character"),
    body('categoryId').isInt({ min: 1 }).withMessage("Category id must be integer"),
    body('description').optional({nullable: true}).isLength({min: 5}).withMessage("Description must be at least 5 characters"),
    body('termCondition').optional({nullable: true}).isLength({min: 5}).withMessage("Term and condition  must be at least 5 characters"),
    body('imageUrl').isLength({ min: 1, max: 255 }).withMessage("Image url must be at least 1 character and maximum 255 characters"),
    body('nominal').optional({nullable: true}).isInt({min: 0}).withMessage("Nominal must be greater than equal zero"),
    body('startDate').optional({nullable: true}).custom(dateValidator.validateDate).withMessage("Start date must be in UTC, ISO-8601, or RFC 2822 format"),
    body('endDate').optional({nullable: true}).custom(dateValidator.validateDate).custom(dateValidator.validateDateRange)
    .withMessage("End date must be in UTC, ISO-8601, or RFC 2822 format and must be higher than start date"),
    body('isDeleted').isBoolean().withMessage("Is deleted must be boolean")
]

exports.validateDeleteProduct = [
    param('code').isLength({ min: 1, max: 25 }).customSanitizer(CaseFormatter.upperingCaseInput)
    .withMessage("Code must be at least 1 character and maximum 25 character")
]

exports.validateGetProduct = [
    query('categoryId').optional({nullable: true}).isInt({ min: 1 }).withMessage("Category id must be integer")
]
