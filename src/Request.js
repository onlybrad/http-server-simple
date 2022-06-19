const http = require("http");

module.exports = class Request extends http.IncomingMessage {
    /**@type {string[]} */                
    #accept

    /**@type {Object<string,string>} */
    #cookies

    /**@type {URL} */                
    #url

    /**@type {Object<string,string>} */
    params

    /**
     * 
     * @param {string|undefined} key 
     * @return {string|object}
     */
    query(key) {
        this.#initUrl();

        if(key) return this.#url.searchParams.get(key);
        
        const queries = {}
        
        for(const [key,value] of this.#url.searchParams.entries()) {
            queries[key] = value;
        }

        return queries;
    }

    get accept() {
        if(!this.#accept) {
            if(!this.headers.accept) return [];

            this.#accept = this.headers.accept.split(',');
        }

        return this.#accept
    }

    get cookies() {
        if(!this.#cookies) {
            if(!this.headers.cookie) return [];

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
        this.#initUrl();

        return this.#url.href;
    }

    get pathname() {
        this.#initUrl();

        return this.#url.pathname;
    }

    #initUrl() {
        if(!this.#url) {
            this.#url = new URL(this.url, "http://"+this.headers.host)
        }
    }
}