const enumKeyValue = {
    PERCENTAGE: 'percentage',
    FIXED: 'fixed'
}

/* istanbul ignore next */
function getEnumConstants() {
    return Object.keys(enumKeyValue);
}

function getEnumValues() {
    return Object.values(enumKeyValue);
}

module.exports = {
    ...
    enumKeyValue,
    getEnumConstants,
    getEnumValues
}
