const http = require("http");
const Router = require("./Router");
const Request = require("./Request");
const Response = require("./Response");

/**
 * @typedef {import("./Router").Methods} Methods
 * @typedef {import("./Router").RouteMiddlewares} RouteMiddlewares
 * @typedef {import("./Router").Middleware} Middleware
 * @typedef {import("./Router").Params} Params
 * @typedef {{router: Router, middlewares: Middleware[]}} RouterMiddlewares
 */

module.exports = class Server {

    /** @type {http.Server}*/
    #server

    /** @type {Middleware}*/
    #notFoundHandler;

    /** @type {Object<string, RouterMiddlewares>}} */
    #routers = {};

    constructor() {
        this.notFoundHandler(require("./middlewares/defaultNotFoundHandler"));
        const options = {
            IncomingMessage: Request,
            ServerResponse: Response
        }

        this.#server = http.createServer(options, (req, res) => this.#serverHandler(req, res));
    }

    /**
     * Set up the handler for when a route is not found.
     * 
     * @param {Middleware} handler
     */
    notFoundHandler(handler) {
        this.#notFoundHandler = handler;
    }

    /**
     * 
     * @param {string} root 
     * @param {Router} router
     * @param {Middleware[] | undefined} [middlewares]
     */
    router(root, router, ...middlewares) {
        if (!root || !(router instanceof Router)) {
            return;
        }

        this.#routers[root] = { router, middlewares };

        return this;
    }

    /**
     * @param {string} path
     * @param {Middleware[]} middlewares 
     */
    get(path, ...middlewares) {
        return this.#addRoute("GET", path, ...middlewares);
    }

    /**
     * @param {string} path
     * @param {Middleware[]} middlewares 
     */
    post(path, ...middlewares) {
        return this.#addRoute("POST", path, ...middlewares);
    }

    /**
     * @param {string} path
     * @param {Middleware[]} middlewares 
     */
    put(path, ...middlewares) {
        return this.#addRoute("PUT", path, ...middlewares);
    }

    /**
     * @param {string} path
     * @param {Middleware[]} middlewares 
     */
    patch(path, ...middlewares) {
        return this.#addRoute("PATCH", path, ...middlewares);
    }

    /**
     * @param {string} path
     * @param {Middleware[]} middlewares 
     */
    delete(path, ...middlewares) {
        return this.#addRoute("DELETE", path, ...middlewares);
    }

    /**
     * 
     * @param {number} port 
     * @param {string | undefined} host 
     */
    listen(port, host) {
        this.#server.listen(port, host);

        return this;
    }

    static Router = Router;

    /**
     * @param {Methods} method
     * @param {string} path
     * @param {Middleware[]} middlewares
     */
    #addRoute(method, path, ...middlewares) {
        let router;
        const routersMiddlewares = this.#routers["/"];

        if (!routersMiddlewares) {
            router = new Router();
            this.router("/", router);
        } else {
            router = routersMiddlewares.router;
        }

        router.addRoute(method, path, ...middlewares);

        return this;
    }

    /**
     * Given the pathname, return the router+middlewares, the route+middlewares and the path associated to the router.
     * 
     * @param {string} pathname
     * @param {string} method
     * @returns {{path: string, routerMiddlewares: RouterMiddlewares , routeMiddlewares: RouteMiddlewares } | {path: null, routerMiddlewares: null, routeMiddlewares: null}}
     */
    #getPathAndRouterAndRoute(pathname, method) {
        const nullReturn = { path: null, routerMiddlewares: null, routeMiddlewares: null };
        const rootsAndPaths = this.#getRouterRootsAndPaths(pathname);

        if (!rootsAndPaths.length === 0) return nullReturn;

        for (const rootAndPath of rootsAndPaths) {
            const { root, path } = rootAndPath;
            const routerMiddlewares = this.#routers[root];
            const routeMiddlewares = routerMiddlewares.router.findRoute(path, method);

            if (routeMiddlewares) {
                return {
                    path,
                    routerMiddlewares,
                    routeMiddlewares
                };
            }
        }

        return nullReturn;
    }

    /**
     * Returns a list of router root and path that match the pathname. Example: if the pathname is "/path/to/some/resource" and there are two routers whose root are "/" and "/path/to", this function will return [{root: "/", path: "/path/to/some/resource"}, {root: "/path/to", path: "/some/resource"}]. This function only checks the existence of the router root, the path may or may not exist.
     * 
     * @param {string} pathname 
     */
    #getRouterRootsAndPaths(pathname) {
        const splitPath = pathname.split("/");
        const routersInfo = [];

        for (let i = 0; i < splitPath.length; i++) {
            const root = splitPath.slice(0, i + 1).join("/") || "/";
            const path = "/" + splitPath.slice(i + 1).join("/");

            if (this.#routers[root]) {
                routersInfo.push(
                    { root, path }
                );
            }
        }

        return routersInfo;
    }

    /**
     * 
     * @param {Request} req 
     * @param {Response} res 
     */
    async #serverHandler(req, res) {
        const { path, routerMiddlewares, routeMiddlewares } = this.#getPathAndRouterAndRoute(req.pathname, req.method);

        if (!routeMiddlewares) return this.#notFoundHandler(req, res);

        if (Object.keys(routeMiddlewares.params).length > 0) {
            req.params = Router.getParams(path, routeMiddlewares.params);
        }

        const middlewares = routerMiddlewares.middlewares.concat(routeMiddlewares.middlewares);

        return callMiddlewares(req, res, ...middlewares);
    }
}

/**
 * 
 * @param {Request} req 
 * @param {Response} res 
 * @param  {Middleware[]} middlewares 
 */
 async function callMiddlewares(req, res, ...middlewares) {
    if (middlewares.length === 0) return null;
    if (middlewares.length === 1) return await (middlewares[0](req, res));

    const next = getNext(req, res, middlewares, 0);

    return await (middlewares[0](req, res, next));
}


/**
 * @param {Request} req
 * @param {Response} res
 * @param {Middleware[]} middlewares 
 * @param {number} index 
 */
function getNext(req, res, middlewares, index) {
    return async function () {
        if (typeof middlewares[index + 1] === "function") {
            const next = getNext(req, res, middlewares, index + 1);

            return await middlewares[index + 1](req, res, next);
        }
    }
}

