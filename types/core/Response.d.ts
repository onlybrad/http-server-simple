export = Response;
declare class Response {
    /**
     * @param {string} text
     */
    text(text: string): any;
    /**
     *
     * @param {string} text
     */
    html(text: string): any;
    /**
     *
     * @param {any} text
     */
    json(text: any): any;
    invalidRange(): any;
    /**
     *
     * @param {number} code
     */
    status(code: number): this;
    /**
     *
     * @param {File} file
     * @param {{ start?: number, end?: number }} [range]
     */
    download(file: File, { start, end }?: {
        start?: number;
        end?: number;
    }): Promise<any>;
}
declare namespace Response {
    export { File };
}
type File = import("./File");
//# sourceMappingURL=Response.d.ts.map