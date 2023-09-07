export = Download;
declare class Download {
    /**
     * @param {Request} req
     * @param {Response} res
     */
    constructor(req: Request, res: Response);
    /**
     *
     * @param {File | string} file
     */
    resumableDownload(file: File | string): any;
    /**
     *
     * @param {File | string} file
     */
    download(file: File | string): Promise<any>;
    #private;
}
declare namespace Download {
    export { Request, Response };
}
import File = require("./filesystem");
type Request = import("../core/Request");
type Response = import("../core/Response");
//# sourceMappingURL=Download.d.ts.map