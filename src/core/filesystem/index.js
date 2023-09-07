const fs = require("fs");
const path = require("path");
const { isString } = require("../../util/guard.js");

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
     * @param {string} [basePath] 
     */
    constructor(basePath) {
        basePath = basePath || process.cwd();
        this.path = basePath;
        this.name = basePath.split(path.sep).pop() || "";
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
        return this.#files.find(file => file.name === filename);
    }

    /**
     * 
     * @param {File | string} file 
     */
    addFile(file) {
        if (!(file instanceof File)) {
            file = new File({
                directory: this,
                name: File.generateFilename(file),
                originalName: file
            });
        }

        if (!this.#files.find(f => f.name === /** @type {File} */(file).name)) {
            this.#files.push(file);
        }
    }

    /**
     * @param {string} filename 
     * @param {string} content 
     */
    async createFile(filename, content) {
        /** @type {Buffer} */
        let buffer;
        const newFilename = File.generateFilename(filename);

        try {
            buffer = Buffer.from(content, "latin1");

            await fs.promises.mkdir(this.#path, { recursive: true });
        } catch (err) {
            if (err.code !== "EEXIST") throw err;
        }

        // @ts-ignore
        await fs.promises.writeFile(path.resolve(this.#path, newFilename), buffer, "binary");

        const file = new File({ directory: this, originalName: filename, name: newFilename });

        this.addFile(file);

        return file;
    }

    /**
     * @param {string} name 
     */
    async createDirectory(name) {
        let directoryPath;

        try {
            directoryPath = path.resolve(this.#path, name);
            await fs.promises.mkdir(directoryPath, { recursive: true });
        } catch (err) {
            if (err.code !== "EEXIST") throw err;
        }

        const directory = new Directory(directoryPath);

        this.#directories.push(directory);

        return directory;
    }

    async delete() {
        try {
            await fs.promises.rm(this.#path, { recursive: true, force: true });
            this.#directories = [];
            this.#files = [];
        } catch (err) {
            console.error("Failed to delete directory: " + err.code);
        }
    }
}

/**
 * @typedef {Object} ConstructorParameters
 * @property {Directory | string} directory
 * @property {string} [originalName]
 * @property {string} name
 */

class File {

    /** @type {Directory} */
    #directory;

    /** @type {string} */
    #originalName;

    /** @type {string} */
    #name;

    /** @type {number} */
    #size;

    /**
     * @param {ConstructorParameters | string} params
     */
    constructor(params) {
        let directory, originalName, name;

        if(isString(params)) {
            const pathArr = params.split(path.sep);
            name = originalName = pathArr.pop() || "";
            directory = new Directory(pathArr.join(path.sep));
        } else {
            ({directory, originalName, name } = params);
            if (!(directory instanceof Directory)) {
                directory = new Directory(directory);
            }
            directory.addFile(this);
        }

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
        return path.resolve(this.#directory.path, this.name);
    }

    get extension() {
        return path.extname(this.name).slice(1);
    }

    get basename() {
        return path.basename(this.name, this.extension ? "." + this.extension : undefined);
    }

    async exists() {
        try {
            await fs.promises.access(this.path);
            return true;
        } catch {
            return false;
        }
    }
    /**
     * 
     * @param {{ start?: number, end?: number }} [range]
     */
    async getSize({ start, end } = {start: undefined, end: undefined}) {
        if (!this.#size) {
            const stat = await fs.promises.stat(this.path);
            this.#size = stat.size;
        }

        if (start == null && end == null) {
            return this.#size;
        } else if (start != null && end == null) {
            return this.#size - start;
        } else if (start == null && end != null) {
            return end + 1;
        } else if(start != null && end != null){
            return end - start + 1;
        }
        
        throw new Error("Unreachable code");
    }

    /**
     * 
     * @param {WritableStream} writeStream 
     * @param {{ start: number, end: number }} [range]
     */
    streamTo(writeStream, { start, end } = {start: 0, end: 0}) {
        const readStream = fs.createReadStream(this.path, { start, end });
        //@ts-ignore
        readStream.pipe(writeStream);

        return new Promise((res, rej) => {
            readStream.on("close", res);
            readStream.on("error", rej);
        });
    }

    /**
     * 
     * @param {BufferEncoding} [encoding]
     */
    async read(encoding) {
        const content = await fs.promises.readFile(this.path, { encoding });

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
            extension ? "." + extension : undefined
        ).replace(/([^a-z0-9]+)/gi, '-') + "-" + new Date().getTime();

        return extension ?
            basename + "." + extension :
            basename
    }
}

module.exports = {
    Directory, File
}