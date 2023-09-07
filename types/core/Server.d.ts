export = Server;
declare class Server {
    /**
     *
     * @param {ServerOpts} [serverOptions]
     */
    constructor(serverOptions?: ServerOpts);
    get temp(): Directory;
    /**
     * Set up the handler for when a route is not found.
     *
     * @param {Middleware} handler
     */
    notFoundHandler(handler: Middleware): void;
    /**
     *
     * @param {string} root
     * @param {Router[]|Router} routers
     * @param {Middleware[]} middlewares
     */
    router(root: string, routers: Router[] | Router, ...middlewares: Middleware[]): this;
    /**
     * @param {string} path
     * @param {Middleware[]} middlewares
     */
    get(path: string, ...middlewares: Middleware[]): this;
    /**
     * @param {string} path
     * @param {Middleware[]} middlewares
     */
    post(path: string, ...middlewares: Middleware[]): this;
    /**
     * @param {string} path
     * @param {Middleware[]} middlewares
     */
    put(path: string, ...middlewares: Middleware[]): this;
    /**
     * @param {string} path
     * @param {Middleware[]} middlewares
     */
    patch(path: string, ...middlewares: Middleware[]): this;
    /**
     * @param {string} path
     * @param {Middleware[]} middlewares
     */
    delete(path: string, ...middlewares: Middleware[]): this;
    /**
     * @param {string} path
     * @param {Middleware[]} middlewares
     */
    head(path: string, ...middlewares: Middleware[]): this;
    /**
     * @param {string} path
     * @param {Middleware[]} middlewares
     */
    options(path: string, ...middlewares: Middleware[]): this;
    /**
     *
     * @param {number} port
     * @param {string | undefined} host
     */
    listen(port: number, host: string | undefined): any;
    close(): any;
    #private;
}
declare namespace Server {
    export { Method, RouteMiddlewares, Middleware, Params, BodyParserOptions, RouterMiddlewares, RoutersMiddlewares, ServerOpts };
}
import Directory = require("./filesystem");
type Middleware = import("./Router").Middleware;
import Router = require("./Router");
type ServerOpts = {
    useBodyParser: boolean;
    bodyParserOptions?: BodyParserOptions;
};
type Method = import("../util/types.js").Method;
type RouteMiddlewares = import("./Router").RouteMiddlewares;
type Params = import("./Router").Params;
type BodyParserOptions = import("../middlewares/bodyParser").BodyParserOptions;
type RouterMiddlewares = {
    router: Router;
    middlewares: Middleware[];
};
type RoutersMiddlewares = {
    routers: Router[];
    middlewares: Middleware[];
};
//# sourceMappingURL=Server.d.ts.map