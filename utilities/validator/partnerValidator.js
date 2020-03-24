const { query, body } = require('express-validator');

exports.validateInsertPartner = [
    body('code').not().isEmpty().withMessage("Code can not be empty"),
    body('name').not().isEmpty().withMessage("Name can not be empty"),
    body('segmentId').not().isEmpty().withMessage("Segment id can not be empty"),
    body('urlLogo').not().isEmpty().withMessage("Url logo can not be empty"),
    body('unit').not().isEmpty().withMessage("Unit can not be empty")
]

exports.validateUpdatePartner = [
    body('name').not().isEmpty().withMessage("Name can not be empty"),
    body('segmentId').not().isEmpty().withMessage("Segment id can not be empty"),
    body('urlLogo').not().isEmpty().withMessage("Url logo can not be empty"),
    body('unit').not().isEmpty().withMessage("Unit can not be empty")
]
