const http = require("http");

/** @typedef {import("../util/File")} File */

module.exports = class Response extends http.ServerResponse {

    /**
     * 
     * @param {string} text 
     */
    text(text) {
        if (text == null) return this.end();

        if (typeof text.toString === "function") {
            text = text.toString();
        }

        this.setHeader("Content-Type", "text/plain");
        this.write(text);

        return this.end();
    }

    /**
     * 
     * @param {string} text 
     */
    html(text) {
        if (text == null) return this.end();

        if (typeof text.toString === "function") {
            text = text.toString();
        }

        this.setHeader("Content-Type", "text/html");
        this.write(text);

        return this.end();
    }

    /**
     * 
     * @param {any} text 
     */
    json(text) {
        //null is valid json, undefined isn't
        if (text === undefined) return this.end();

        if (typeof text === "object") {
            //to prevent error due to recursion
            try {
                text = JSON.stringify(text);
            } catch(err) {
                return this.end();
            }
        }

        this.setHeader("Content-Type", "application/json");
        this.write(text);

        return this.end();
    }

    invalidRange() {
        this.status(416);

        return this.end();
    }

    /**
     * 
     * @param {number} code 
     */
    status(code) {
        super.statusCode = code;

        return this;
    }

    /**
     * 
     * @param {File} file 
     * @param {{ start: number|null, end: number|null }} [range]
     */
    async download(file, { start, end } = {}) {
        if (!file) return this.end();

        const totalSize = await file.getSize();
        if (start == null) start = 0;
        if (end == null) end = totalSize - 1;

        if (!isValidRange(totalSize, start, end)) {
            return this.invalidRange();
        }

        const downloadedSize = await file.getSize({ start, end });

        if (totalSize !== downloadedSize) {
            this.status(206);
            this.setHeader("Content-Range", `bytes ${start}-${end}/${totalSize}`);
        }

        this.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(file.name)}"`);
        this.setHeader("Content-Length", downloadedSize);
        return file.streamTo(this, { start, end });
    }
}

/**
 * 
 * @param {number} totalSize 
 * @param {number} start 
 * @param {number} end 
 */
function isValidRange(totalSize, start, end) {
    if (start + 1 > totalSize || end + 1 > totalSize) {
        return false;
    }

    if (start > end) return false;

    return true;
}