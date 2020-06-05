const wrapper = require('../wrapper');
const { BadRequestError } = require('../error');

module.exports = async (req, res, next) => {
	let limit = null;
	let skip = null;
	let page = null;

	if (req.query.page && req.query.limit) {
		page = parseInt(req.query.page);
		limit = parseInt(req.query.limit);
		if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
			let error = wrapper.error(new BadRequestError("Page & Limit must be positive integer value"));
        	wrapper.response(res, false, error);
        	return;
		}
		skip = (page - 1) * limit;
	} else if (req.query.page) {
		// set limit to default 10 records per page
		limit = 10;
		page = parseInt(req.query.page);
		if (isNaN(page) || page < 1) {
			let error = wrapper.error(new BadRequestError("Page must be positive integer value"));
        	wrapper.response(res, false, error);
        	return;
		}
		skip = (page - 1) * limit;
	} else if (req.query.limit) {
		limit = parseInt(req.query.limit);
		if (isNaN(limit) || limit < 1) {
			let error = wrapper.error(new BadRequestError("Limit must be positive integer value"));
        	wrapper.response(res, false, error);
        	return;
		}
	}

	req.query.limit = limit;
	req.query.offset = skip;
	req.query.page = page;
	next();
};
