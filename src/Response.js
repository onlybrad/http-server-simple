const http = require("http");

module.exports = class Response extends http.ServerResponse {

    /**
     * 
     * @param {string} text 
     */
    text(text) {
        if(!text) return this;

        if(typeof text.toString === "function") {
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
        if(!text) return this;

        if(typeof text.toString === "function") {
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
        if(text === undefined) return this;

        if(typeof text === "object") {
            text = JSON.stringify(text);
        } 

        this.setHeader("Content-Type","application/json");
        this.write(text);
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
}