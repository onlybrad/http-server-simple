const fs = require("fs/promises");
const path = require("path");
const File = require("./File");

/** @typedef {import("./File")} File */

module.exports = 

class Directory {

    /** @type {string} */
    #path;

    /** @type {string} */
    #name;

    /** @type {Directory[]} */
    #directories = [];

    /** @type {File[]} */
    #files = [];

    /**
     * 
     * @param {string} [directory] 
     */
    constructor(path=process.cwd()) {
        this.path = path;
        this.name = path.split(path.sep).pop();
    }

    /**
     * @param {string} path
     */
    set path(path) {
        this.#path = path;
    }

    get path() {
        return this.#path;
    }

    /**
     * @param {string} name
     */
    set name(name) {
        this.#name = name;
    }

    get name() {
        return this.#name;
    }

    /**
     * 
     * @param {string} name 
     */
    getDirectory(name) {
        return this.#directories.find(dir => dir.#name === name);
    }

    /**
     * 
     * @param {string} filename 
     */
    getFile(filename) {
        return this.#files.find(file => file.filename === filename);
    }

    /**
     * @param {string} filename 
     * @param {string} content 
     */
    async createFile(filename,content) {
        let buffer;
        const newFilename = File.generateFilename(filename);

        try {
            buffer = Buffer.from(content, "latin1");

            await fs.mkdir(this.#path, {recursive: true});
        } catch(err) {
            if(err.code !== "EEXIST") throw err;
        }

        await fs.writeFile(path.resolve(this.#path, newFilename), buffer, "binary");

        const file = new File({directory: this, originalName: filename, name: newFilename});

        this.#files.push(file);

        return file;
    }

    async createDirectory(name) {
        let path;
        
        try {
            path = path.resolve(this.#path, name);
            await fs.mkdir(path, {recursive: true});
        } catch(err) {
            if(err.code !== "EEXIST") throw err;
        }

        const directory = new Directory(path);

        this.#directories.push(directory);

        return directory;
    }

    async delete() {
        try {
            await fs.rm(this.#path, {recursive: true, force: true});
            this.#directories = [];
            this.#files = [];
        } catch(err) {  
            console.error("Failed to delete directory: " + err.code);
        }
    }
}