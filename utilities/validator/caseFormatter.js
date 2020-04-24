exports.loweringCaseInput = function (value) {
    if (value) {
        return value.toLowerCase();
    }
    return value;
}

exports.upperingCaseInput = function (value) {
    if (value) {
        return value.toUpperCase();
    }
    return value;
}
