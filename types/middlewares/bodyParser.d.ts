declare function _exports({ parseJson, parseUrlEncoded, parseFormData }?: BodyParserOptions): (req: Request, res: Response, next: () => Promise<void>) => Promise<void>;
export = _exports;
export type BodyParserOptions = {
    parseJson: boolean;
    parseUrlEncoded: boolean;
    parseFormData: boolean;
};
export type Request = import("../core/Request");
export type Response = import("../core/Response");
/**
 * @param {Request} req
 * @param {string} body
 */
declare function parseFormData(req: Request, body: string): Promise<{}>;
//# sourceMappingURL=bodyParser.d.ts.map