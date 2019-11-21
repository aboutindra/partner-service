const sendResponds = (res, status, message='Service not available', data=[], code=503) => {
	return res.status(code).json({
		status: status,
		code: code,
		data: data,
		message: message
	});
}

module.exports = sendResponds;
