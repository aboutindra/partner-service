const moment = require('moment');

exports.validateDate = function(dateString) {
    if (!dateString) {
        return false;
    }

    return moment(dateString).isValid();
}

exports.validateDateRange = function (_, { req }) {
    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);

    return (startDate.getTime() < endDate.getTime());
}
