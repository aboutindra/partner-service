const enumKeyValue = {
    PARTNER: 'partner',
    USER: 'user'
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
