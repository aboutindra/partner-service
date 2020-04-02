const moment = require('moment');

exports.validateDate = function(dateString) {
    let date = moment(dateString);

    return date.isValid();
}

exports.validateDateRange = function (_, { req }) {
    let startDate = new Date(req.body.startDate);
    let endDate = new Date(req.body.endDate);

    return (startDate.getTime() < endDate.getTime());
}
