/** @typedef {import("../core/Request")} Request */
/** @typedef {import("../core/Response")} Response */

const File = require("./File");

module.exports =

class Download {

    /** @type {Request} */
    #req;

    /** @type {Response} */
    #res;

    /**
     * @param {Request} req
     * @param {Response} res
     */
    constructor(req,res) {
        this.#req = req;
        this.#res = res;
    }

    /**
     * 
     * @param {File | string} file 
     */
    resumableDownload(file) {
        if(!(file instanceof File)) {
            file = new File(file);
        }

        if(!this.#req.range) {
            return this.#res.download(file);
        }

        if(!this.#isValidRange()) {
            return Promise.resolve().then(() => this.#res.invalidRange());
        }

        if(this.#req.range.ranges) {
            const {start,end} = this.#req.range.ranges[0];
            return this.#res.download(file,{start,end});
        }

        const end = this.#req.range.suffixLengths[0] - 1;
        return this.#res.download(file,{end});
    }

    /**
     * 
     * @param {File | string} file 
     */
    download(file) {
        if(!(file instanceof File)) {
            file = new File(file);
        }
        return this.#res.download(file);
    }

    #isValidRange() {
        if(!this.#req.range.unit || this.#req.range.unit !== "bytes") return false;
    
        if(this.#req.range.ranges === null && this.#req.range.suffixLengths === null) return false;
    
        return true;
    }
}