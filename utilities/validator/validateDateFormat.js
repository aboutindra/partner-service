exports.validateDate = function(dateString) {
    let date = moment(dateString);
    if (date.isValid()) {
        return true;
    } else {
        return false;
    }
}

exports.validateDateRange = function (_, { req }) {
    let startDate = new Date(req.body.startDate);
    let endDate = new Date(req.body.endDate);

    if (startDate.getTime() < endDate.getTime()) {
        return true;
    } else {
        return false;
    }
}
