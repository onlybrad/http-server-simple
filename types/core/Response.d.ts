/// <reference types="node" />
export = Response;
declare class Response extends http.ServerResponse<http.IncomingMessage> {
    constructor(req: http.IncomingMessage);
    /**
     * @param {string} text
     */
    text(text: string): this;
    /**
     *
     * @param {string} text
     */
    html(text: string): this;
    /**
     *
     * @param {any} text
     */
    json(text: any): this;
    invalidRange(): this;
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
import http = require("http");
type File = import("./File");
//# sourceMappingURL=Response.d.ts.map