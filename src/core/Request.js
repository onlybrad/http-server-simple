const http = require("http");

/** @typedef {import("../core/Server")} Server */

/** @typedef {{ start: number, end: number|undefined }} Range */

/**
 * @typedef {Object} RangeType
 * @property {string | null} unit
 * @property {Range[] | null} ranges;
 * @property {number[] | null} suffixLengths;
 */

module.exports = class Request extends http.IncomingMessage {
    /**@type {string[]} */
    #accept;

    /**@type {string? } */
    #boundary;

    /**@type {string} */
    #charset;

    /**@type {string[]} */
    #contentType;

    /**@type {Record<string,string>} */
    #cookies;

    /** @type { RangeType? } */
    #range;

    /** @type {Server} */
    #server;

    /**@type {URL} */
    #url;

    /**@type {Record<string,string>} */
    params;

    /** @type {unknown} */
    body;

    /**
     * @param {string} [key] 
     * @return {string|Record<string,string>|null}
     */
    query(key) {
        const url = this.#getUrl();

        if (key) {
            return url.searchParams.get(key);
        }

        /** @type {Record<string,string>} */
        const queries = {}

        for (const [key, value] of url.searchParams.entries()) {
            queries[key] = value;
        }

        return queries;
    }

    get accept() {
        if (!this.#accept) {
            const accept = this.headers.accept;
            this.#accept = accept ? accept.split(',').map(word => word.trim()) : [];
        }

        return this.#accept
    }

    get wantsJson() {
        return this.accept.includes("application/json");
    }

    get wantsXml() {
        return this.accept.includes("application/xml");
    }

    get wantsHtml() {
        return this.accept.includes("text/html") || this.accept.includes("application/xhtml+xml");
    }

    get wantsAny() {
        return this.accept.includes("*/*");
    }

    get contentType() {
        return this.#getContentType()[0] || null;
    }

    get charset() {
        if (!this.#charset) {
            let charset = this.#getContentType()[1];

            if (!charset || !charset.startsWith("charset=")) charset = "charset=utf-8";

            this.#charset = charset.substring(8);
        }

        return this.#charset;
    }

    get boundary() {
        if (!this.#boundary) {
            const boundary = this.#getContentType()[1];

            if (!boundary || !boundary.startsWith("boundary=")) {
                this.#boundary = null;
            }

            this.#boundary = boundary.substring(9);
        }

        return this.#boundary;
    }

    get cookies() {
        if (!this.#cookies) {
            if (!this.headers.cookie) return {};

            this.#cookies = this.headers.cookie
                .split(";")
                .map(keyValue => keyValue.split("="))
                .reduce((cookies, keyValuePair) => {
                    cookies[decodeURIComponent(keyValuePair[0].trim())] = decodeURIComponent(keyValuePair[1].trim());
                    return cookies;
                }, {});

        }

        return this.#cookies;
    }

    get range() {
        if (this.#range !== undefined) {
            return this.#range;
        }

        if (!this.headers.range) {
            this.#range = null;
            return this.#range;
        }

        this.#range = { unit: null, ranges: null, suffixLengths: null };

        const rangeArr = this.headers.range.split("=");

        if (!rangeArr[0]) {
            this.#range.unit = null;
            this.#range.ranges = null;
            return this.#range;
        }

        this.#range.unit = rangeArr[0];

        if (!rangeArr[1]) {
            this.#range.ranges = null;
            return this.#range;
        }

        this.#range.ranges = [];
        this.#range.suffixLengths = [];

        const ranges = rangeArr[1].split(",").map(range => range.trim());

        for (const range of ranges) {
            const match = range.match(/^(\d*)-(\d*)$/);

            if (!match || (match[1] === "" && match[2] === "")) {
                this.#range.ranges = null;
                this.#range.suffixLengths = null;
                return this.#range;
            }

            if (match[1] === "") {
                this.#range.suffixLengths.push(+match[2]);
            } else {
                this.#range.ranges.push({
                    start: +match[1],
                    end: match[2] === "" ? undefined : +match[2]
                });
            }
        }

        if (this.#range.ranges.length === 0) {
            this.#range.ranges = null;
        }
        if (this.#range.suffixLengths.length === 0) {
            this.#range.suffixLengths = null;
        }

        return this.#range;
    }

    get fullUrl() {
        return this.#getUrl().href;
    }

    get pathname() {
        return this.#getUrl().pathname;
    }

    get server() {
        return this.#server;
    }

    /**
     * @param {Server} server
     */
    set server(server) {
        this.#server = server;
    }

    #getContentType() {
        if (!this.#contentType) {
            const contentType = this.headers["content-type"];
            this.#contentType = contentType ? contentType.split(';').map(word => word.trim()) : [];
        }
        return this.#contentType;
    }

    #getUrl() {
        if (!this.#url) {
            this.#url = new URL(this.url || "", "http://" + this.headers.host)
        }
        return this.#url;
    }
}