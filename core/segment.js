const wrapper = require('../utilities/wrapper');
const Segment = require('../databases/postgresql/models/segment');
const segment = new Segment(process.env.POSTGRESQL_DATABASE_PARTNER);
const { ERROR:erroCode, SUCCESS:successCode } = require('../utilities/httpStatusCode');
const { NotFoundError,InternalServerError,ConflictError,BadRequestError,ForbiddenError } = require('../utilities/error');

const insertSegment = async (request, response) => {
    let { name } = request.body;

    let result = await segment.insertSegment(name);

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Segment added", successCode.CREATED);
    }
}

const updateSegment = async (request, response) => {
    let id = request.params.id;
    let { name } = request.body;

    if (isNaN(id)) {
        wrapper.response(response, false, wrapper.error(new BadRequestError("Id must be an integer value")));
        return;
    }

    let result = await segment.updateSegment(id, name);

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Segment updated", successCode.OK);
    }
    return;
}

const getSegments = async (request, response) => {
    let result;

    if (request.query.id) {
        let id = parseInt(request.query.id);
        if (isNaN(id)) {
            wrapper.response(response, false, wrapper.error(new BadRequestError("Id must be an integer value")));
            return;
        }
        result = await segment.getSegmentById(id);
    } else {
        result = await segment.getAllSegment();
    }

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Packages retrieved", successCode.OK);
    }
    return;
}

module.exports = {
    insertSegment,
    updateSegment,
    getSegments
}