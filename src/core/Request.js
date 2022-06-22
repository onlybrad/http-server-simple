const http = require("http");

/** @typedef {import("../core/Server")} Server */

module.exports = class Request extends http.IncomingMessage {
    /**@type {string[]} */                
    #accept;

    /**@type {string} */
    #boundary;

    /**@type {string} */
    #charset;

    /**@type {string[]} */
    #contentType;

    /**@type {Object<string,string>} */
    #cookies;

    /** @type {} */
    #server;

    /**@type {URL} */                
    #url;

    /**@type {Object<string,string>} */
    params;

    /**
     * 
     * @param {string|undefined} key 
     * @return {string|object}
     */
    query(key) {
        const url = this.#getUrl();

        if(key) return url.searchParams.get(key);
        
        const queries = {}
        
        for(const [key,value] of url.searchParams.entries()) {
            queries[key] = value;
        }

        return queries;
    }

    get accept() {
        if(!this.#accept) {
            const accept = this.headers.accept;
            this.#accept = accept ? accept.split(',').map(word => word.trim()) : [];
        }

        return this.#accept
    }

    get contentType() {
        return this.#getContentType()[0] || null;
    }

    get charset() {
        if(!this.#charset) {
            let charset = this.#getContentType()[1];

            if(!charset || !charset.startsWith("charset=")) charset = "charset=utf-8";
    
            this.#charset = charset.substring(8); 
        }

        return this.#charset;
    }

    get boundary() {
        if(!this.#boundary) {
            const boundary = this.#getContentType()[1];

            if(!boundary || !boundary.startsWith("boundary=")) this.#boundary = null;
    
            this.#boundary = boundary.substring(9); 
        }

        return this.#boundary;        
    }

    get cookies() {
        if(!this.#cookies) {
            if(!this.headers.cookie) return {};

            this.#cookies = this.headers.cookie
                .split(";")
                .map(keyValue => keyValue.split("="))
                .reduce((cookies, keyValuePair) => {
                    cookies[decodeURIComponent(keyValuePair[0].trim())] = decodeURIComponent(keyValuePair[1].trim());
                    return cookies;
                },{});

        }

        return this.#cookies;
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
        if(!this.#contentType) {
            const contentType = this.headers["content-type"];
            this.#contentType = contentType ? contentType.split(';').map(word => word.trim()) : [];
        }
        return this.#contentType;
    }

    #getUrl() {
        if(!this.#url) {
            this.#url = new URL(this.url, "http://"+this.headers.host)
        }
        return this.#url;
    }
}