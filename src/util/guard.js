const {BUFFER_ENCODING, SUPPORTED_METHODS} = require("./types.js");

/**
 * @param {string} str
 * @return {str is BufferEncoding} 
 */
function isBufferEncoding(str) {
    return BUFFER_ENCODING.includes(/** @type {BufferEncoding} */(str));
}

/**
 * @param {string} str
 * @return {str is import("./types.js").Method} 
 */
function isSupportedMethod(str) {
    return SUPPORTED_METHODS.includes(/** @type {import("./types.js").Method} */(str));
}

/**
 * @param {unknown} str 
 * @return {str is string}
 */
function isString(str) {
    return typeof str === "string" || str instanceof String;
}

module.exports = {
    isBufferEncoding,
    isSupportedMethod,
    isString
}