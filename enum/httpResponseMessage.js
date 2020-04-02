const enumKeyValue = {
    INVALID_INPUT_PARAMETER: 'Invalid input parameter',
    INTERNAL_SERVER_ERROR: 'Internal server error'
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
