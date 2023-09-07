const SUPPORTED_METHODS = /** @type {const} */(
    ["GET","POST","PUT","PATCH","HEAD","OPTIONS","DELETE"]
);

const BUFFER_ENCODING = /** @type {const} */(
    ["ascii", "utf8", "utf-8", "utf16le", "ucs2", "ucs-2", "base64", "base64url", "latin1", "binary", "hex"]
);

/** @typedef {typeof SUPPORTED_METHODS[number]} Method */

module.exports = {
    SUPPORTED_METHODS,
    BUFFER_ENCODING
}