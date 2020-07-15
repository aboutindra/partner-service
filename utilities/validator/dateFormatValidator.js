const moment = require('moment');

exports.validateDate = function(dateString) {
    if (!dateString)
        return false;

    return moment(dateString).isValid();
}

exports.validateDateRange = function (_, { req }) {
    let startDate = new Date(req.body.startDate);
    let endDate = new Date(req.body.endDate);

    return (startDate.getTime() < endDate.getTime());
}
