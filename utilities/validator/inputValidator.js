const ResponseWrapper = require('../wrapper');
const ErrorMessage = require('../../enum/httpResponseMessage');
const { validationResult } = require('express-validator');
const { BadRequestError } = require('../../utilities/error');

function validateInput (request, response, next) {
    const errors = validationResult(request);
	if (!errors.isEmpty()) {
        const error = ResponseWrapper.error(new BadRequestError(ErrorMessage.INVALID_INPUT_PARAMETER));
        error.data = errors.array();
        ResponseWrapper.response(response, false, error);
		return;
    }
    next();
}

module.exports = validateInput;
