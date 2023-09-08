export type ConstructorParameters = {
    directory: Directory | string;
    originalName?: string;
    name: string;
};
export class Directory {
    /**
     *
     * @param {string} [basePath]
     */
    constructor(basePath?: string);
    /**
     * @param {string} path
     */
    set path(arg: string);
    get path(): string;
    /**
     * @param {string} name
     */
    set name(arg: string);
    get name(): string;
    /**
     *
     * @param {string} name
     */
    getDirectory(name: string): Directory;
    /**
     *
     * @param {string} filename
     */
    getFile(filename: string): File;
    /**
     *
     * @param {File | string} file
     */
    addFile(file: File | string): void;
    /**
     * @param {string} filename
     * @param {string} content
     */
    createFile(filename: string, content: string): Promise<File>;
    /**
     * @param {string} name
     */
    createDirectory(name: string): Promise<Directory>;
    delete(): Promise<void>;
    #private;
}
/**
 * @typedef {Object} ConstructorParameters
 * @property {Directory | string} directory
 * @property {string} [originalName]
 * @property {string} name
 */
export class File {
    /**
     *
     * @param {string} filename
     */
    static generateFilename(filename: string): string;
    /**
     * @param {ConstructorParameters | string} params
     */
    constructor(params: ConstructorParameters | string);
    get directory(): Directory;
    get originalName(): string;
    get name(): string;
    get path(): string;
    get extension(): string;
    get basename(): string;
    exists(): Promise<boolean>;
    /**
     *
     * @param {{ start?: number, end?: number }} [range]
     */
    getSize({ start, end }?: {
        start?: number;
        end?: number;
    }): Promise<number>;
    /**
     *
     * @param {WritableStream} writeStream
     * @param {{ start: number, end: number }} [range]
     */
    streamTo(writeStream: WritableStream, { start, end }?: {
        start: number;
        end: number;
    }): Promise<any>;
    /**
     *
     * @param {BufferEncoding} [encoding]
     */
    read(encoding?: BufferEncoding): Promise<string>;
    #private;
}
//# sourceMappingURL=index.d.ts.map