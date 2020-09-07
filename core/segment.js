const wrapper = require('../utilities/wrapper');
const { validationResult } = require('express-validator');
const Segment = require('../databases/postgresql/models/segment');
const segment = new Segment(process.env.POSTGRESQL_DATABASE_PARTNER);
const { SUCCESS:successCode } = require('../enum/httpStatusCode');
const { BadRequestError } = require('../utilities/error');

const insertSegment = async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        const error = wrapper.error(new BadRequestError("Invalid input parameter"));
        error.data = errors.array();
        wrapper.response(response, false, error);
        return;
    }

    const { name } = request.body;

    const result = await segment.insertSegment(name);

    if (result.err) {
        wrapper.response(response, false, result);
    } else {
        wrapper.response(response, true, result, "Segment added", successCode.CREATED);
    }
    return;
}

const updateSegment = async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        const error = wrapper.error(new BadRequestError("Invalid input parameter"));
        error.data = errors.array();
        wrapper.response(response, false, error);
        return;
    }

    const id = parseInt(request.params.id);
    const { name } = request.body;

    const result = await segment.updateSegment(id, name);

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
        const id = parseInt(request.query.id);
        if (isNaN(id) || id < 0) {
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
        wrapper.response(response, true, result, "Segment(s) retrieved", successCode.OK);
    }
    return;
}

module.exports = {
    insertSegment,
    updateSegment,
    getSegments
}
