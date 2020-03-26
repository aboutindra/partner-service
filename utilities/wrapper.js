const { NotFoundError, InternalServerError, BadRequestError, ForbiddenError } = require('./error');
const { ERROR:httpError } = require('./httpStatusCode');

const checkErrorCode = (error) => {
  /* istanbul ignore next */
    switch (error.constructor) {
    case BadRequestError:
      return httpError.BAD_REQUEST;
    case ForbiddenError:
      return httpError.FORBIDDEN;
    case InternalServerError:
      return httpError.INTERNAL_ERROR;
    case NotFoundError:
      return httpError.NOT_FOUND;
    default:
      return httpError.FORBIDDEN;
    }
  };

const data = (data) => ({ err: null, data});

const paginationData = (data, meta) => ({ err: null, data, meta});

const error = (err) => ({ err, data: [] });

const response = (res, status, result, message = '', code = 200) => {
  let data = result.data;
  if(status === false){
    data = data || [];
    message = result.err.message || message;
    code = checkErrorCode(result.err);
  }
  res.status(code).send(
    {
      status,
      data,
      message,
      code
    });
};

const paginationResponse = (res, status, result, message = '', code = 200) => {
  let data = result.data;
  /* istanbul ignore next */
  if(status === false){
    data = data || [];
    message = result.err.message || message;
    code = checkErrorCode(result.err);
  }
  res.status(code).send(
    {
      status,
      data,
      meta: result.meta,
      code,
      message
    }
  );
};

module.exports = {
  data,
  paginationData,
  error,
  response,
  paginationResponse
};
