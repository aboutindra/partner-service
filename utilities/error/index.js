const ForbiddenError = require('./forbidden_error');
const InternalServerError = require('./internal_server_error');
const NotFoundError = require('./not_found_error');
const BadRequestError = require('./bad_request_error');

module.exports = {
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  BadRequestError
};
