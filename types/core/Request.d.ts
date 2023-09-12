/// <reference types="node" />
export = Request;
declare class Request extends http.IncomingMessage {
    /**@type {Record<string,string>} */
    params: Record<string, string>;
    /** @type {unknown} */
    body: unknown;
    /**
     * @overload
     * @param {string} key
     * @return {string | null}
     *
     * @overload
     * @return {Record<string,string>}
     *
     * @param {string} [key]
     * @return {(string | null) | Record<string,string>}
     */
    query(key: string): string | null;
    /**
     * @overload
     * @param {string} key
     * @return {string | null}
     *
     * @overload
     * @return {Record<string,string>}
     *
     * @param {string} [key]
     * @return {(string | null) | Record<string,string>}
     */
    query(): Record<string, string>;
    get accept(): string[];
    get wantsJson(): boolean;
    get wantsXml(): boolean;
    get wantsHtml(): boolean;
    get wantsAny(): boolean;
    get contentType(): string;
    get charset(): string;
    get boundary(): string;
    get cookies(): Record<string, string>;
    get range(): RangeType;
    get fullUrl(): string;
    get pathname(): string;
    /**
     * @param {Server} server
     */
    set server(arg: import("../core/Server"));
    get server(): import("../core/Server");
    #private;
}
declare namespace Request {
    export { Server, Range, RangeType };
}
import http = require("http");
type RangeType = {
    unit: string | null;
    /**
     * ;
     */
    ranges: Range[] | null;
    /**
     * ;
     */
    suffixLengths: number[] | null;
};
type Server = import("../core/Server");
type Range = {
    start: number;
    end: number | undefined;
};
//# sourceMappingURL=Request.d.ts.map