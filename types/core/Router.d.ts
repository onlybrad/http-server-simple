export = Router;
declare class Router {
    /**
     * @param {string} prefix
     * @param {PrefixCallback} cb
     */
    static prefix(prefix: string, cb: PrefixCallback): import("./Router");
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
     * @param {string} path
     * @param {import("../util/types.js").Method} method
     * @returns {RouteMiddlewares | null}
     */
    findRoute(path: string, method: import("../util/types.js").Method): RouteMiddlewares | null;
    /**
     * @param {import("../util/types.js").Method} method
     * @param {string} path
     * @param {Middleware[]} middlewares
     */
    addRoute(method: import("../util/types.js").Method, path: string, ...middlewares: Middleware[]): void;
    /**
     *
     * @param {string} path
     * @param {Params} routeParams
     */
    getParams(path: string, routeParams: Params): Record<string, string>;
    #private;
}
declare namespace Router {
    export { Middleware, RouteMiddlewares, Params, PrefixCallback };
}
type Middleware = (request: import("./Request"), response: import("./Response"), next?: () => Promise<void>) => void;
type RouteMiddlewares = {
    path: string;
    params: Params;
    middlewares: Middleware[];
};
type Params = Record<number, string>;
type PrefixCallback = (router: Router) => void;
//# sourceMappingURL=Router.d.ts.map