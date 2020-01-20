const { query, body } = require('express-validator');

exports.validateInsert = [
    body('code').not().isEmpty().withMessage("Code can not be empty"),
    body('name').not().isEmpty().withMessage("Name can not be empty"),
    body('segmentId').not().isEmpty().withMessage("Segment id can not be empty"),
    body('urlLogo').not().isEmpty().withMessage("Url logo can not be empty"),
    body('unit').not().isEmpty().withMessage("Unit can not be empty")
]

exports.validateUpdate = [
    body('name').not().isEmpty().withMessage("Name can not be empty"),
    body('segmentId').not().isEmpty().withMessage("Segment id can not be empty"),
    body('urlLogo').not().isEmpty().withMessage("Url logo can not be empty"),
    body('unit').not().isEmpty().withMessage("Unit can not be empty")
]

exports.validateGet = [
    query('page').optional({ nullable: true }).isInt({ min: 1 }).withMessage("Page must be filled with integer greater than 0"),
    query('limit').optional({ nullable: true }).isInt({ min: 1 }).withMessage("Limit must be filled with integer greater than 0"),
]
