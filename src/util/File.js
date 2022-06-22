const path = require("path");
const fs = require("fs/promises");

/** @typedef {import("./Directory")} Directory */

/**
 * @typedef {Object} ConstructorParameters
 * @property {Directory} directory
 * @property {string} [originalName]
 * @property {string} filename
 */


module.exports =

class File {

    /** @type {Directory} */
    #directory;

    /** @type {string} */
    #originalName;

    /** @type {string} */
    #name;

    /**
     * @param {ConstructorParameters} params
     */
    constructor({directory, originalName, name}) {
        this.#directory = directory;
        this.#originalName = originalName || name;
        this.#name = name;
    }

    get directory() {
        return this.#directory;
    }

    get originalName() {
        return this.#originalName;
    }

    get name() {
        return this.#name;
    }
    
    get path() {
        return path.resolve(this.#directory.path,this.name);
    }

    get extension() {
        return path.extname(this.name);
    }

    get basename() {
        return path.basename(this.name, this.extension ? "."+this.extension : undefined);
    }

    /**
     * 
     * @param {BufferEncoding} encoding 
     */
    async read(encoding) {
        const content = await fs.readFile(this.path, {encoding});

        return content instanceof Buffer ?
            content.toString() :
            content;
    }

    /**
     * 
     * @param {string} filename 
     */
    static generateFilename(filename) {
        const extension = path.extname(filename).replace(/([^a-z0-9]+)/gi, '');
        const basename = path.basename(filename,
            extension ? "."+extension : undefined
        ).replace(/([^a-z0-9]+)/gi, '-') + "-" + new Date().getTime();

        return extension ? 
            basename + "." + extension :
            basename
    }
}