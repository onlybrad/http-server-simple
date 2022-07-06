const http = require("http");
const path = require("path");
const Router = require("./Router");
const Request = require("./Request");
const Response = require("./Response");
const File = require("../util/File");
const Directory = require("../util/Directory");
const Download = require("../util/Download");

/**
 * @typedef {import("./Router").Methods} Methods
 * @typedef {import("./Router").RouteMiddlewares} RouteMiddlewares
 * @typedef {import("./Router").Middleware} Middleware
 * @typedef {import("./Router").Params} Params
 * @typedef {import("../middlewares/bodyParser").BodyParserOptions} BodyParserOptions
 * 
 * @typedef {{router: Router, middlewares: Middleware[]}} RouterMiddlewares
 * @typedef {{routers: Router[], middlewares: Middleware[]}} RoutersMiddlewares
 * @typedef {{ useBodyParser: boolean, bodyParserOptions: BodyParserOptions }} ServerOptions
 */

/** @type {ServerOptions} */
const defaultOptions = {
    useBodyParser: true,
    bodyParserOptions: undefined
}

module.exports = class Server {
    static Router = Router;
    static File = File;
    static Directory = Directory;
    static Download = Download;

    /** @type {http.Server}*/
    #server;

    /** @type {Middleware}*/
    #notFoundHandler;

    /** @type {Object<string, RoutersMiddlewares>}} */
    #routers = {};

    /** @type {ServerOptions} */
    #serverOptions;

    /** @type {Directory} */
    #temp;

    /**
     * 
     * @param {ServerOptions} [serverOptions]
     */
    constructor(serverOptions = defaultOptions) {
        this.#serverOptions = serverOptions;
        const options = {
            IncomingMessage: Request,
            ServerResponse: Response
        }

        this.notFoundHandler(require("../middlewares/defaultNotFoundHandler"));

        this.#createTempDirectories();

        this.#server = http.createServer(options, (req, res) => this.#serverHandler(req, res));

        process.on("SIGINT", async () => {
            await this.temp.delete();
            process.exit();
        });
    }

    get temp() {
        return this.#temp;
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
     * @param {Router[]} routers
     * @param {Middleware[]} [middlewares]
     */
    router(root, routers, ...middlewares) {
        if (!root) return;

        if(!Array.isArray(routers)) {
            routers = [routers];
        }

        this.#routers[root] = { routers, middlewares };

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
        return new Promise(res => {
            this.#server.listen(port, host, res);
        });
    }

    close() {
        return new Promise(res => {
            this.#server.close(res);
        });
    }

    #createTempDirectories() {
        this.#temp = new Directory(path.resolve(__dirname, "../../temp"));
    }

    /**
     * 
     * @param {Request} req 
     */
    #getMiddlewares(req) {
        const { path, routerMiddlewares, routeMiddlewares } = this.#getPathAndRouterAndRoute(req.pathname, req.method);

        if(!routerMiddlewares) return null;

        if (Object.keys(routeMiddlewares.params).length > 0) {
            req.params = routerMiddlewares.router.getParams(path, routeMiddlewares.params);
        }

        /**
         * @type {Middleware[]}
         */
        const middlewares = [];

        if(this.#serverOptions.useBodyParser) {
            const bodyParser = require("../middlewares/bodyParser");
            middlewares.push(bodyParser(this.#serverOptions.bodyParserOptions));
        }
        
        middlewares.push(...routerMiddlewares.middlewares, ...routeMiddlewares.middlewares);

        return middlewares;
    }

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
            router = routersMiddlewares.routers[0];
        }

        router.addRoute(method, path, ...middlewares);

        return this;
    }

    /**
     * Given the pathname, return the router+middlewares, the route+middlewares and the path associated to the router.
     * 
     * @param {string} pathname
     * @param {Methods} method
     * @returns {{path: string, routerMiddlewares: RouterMiddlewares , routeMiddlewares: RouteMiddlewares } | {path: null, routerMiddlewares: null, routeMiddlewares: null}}
     */
    #getPathAndRouterAndRoute(pathname, method) {
        const nullReturn = { path: null, routerMiddlewares: null, routeMiddlewares: null };
        const rootsAndPaths = this.#getRouterRootsAndPaths(pathname);

        if (!rootsAndPaths.length === 0) return nullReturn;

        for (const rootAndPath of rootsAndPaths) {
            const { root, path } = rootAndPath;
            const routersMiddlewares = this.#routers[root];
            
            for(const router of routersMiddlewares.routers) {
                const routeMiddlewares = router.findRoute(path, method);

                if (routeMiddlewares) {
                    return {
                        path,
                        routerMiddlewares:{router, middlewares: routersMiddlewares.middlewares},
                        routeMiddlewares
                    };
                }
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
        const splitPath = pathname.split("/").map(word => (word.endsWith("/") ? word.slice(0,-1) : word));
        const result = [];

        for (let i = 0; i < splitPath.length; i++) {
            const root = splitPath.slice(0, i + 1).join("/") || "/";
            const path = "/" + splitPath.slice(i + 1).join("/");

            if (this.#routers[root]) {
                result.push(
                    { root, path }
                );
            }
        }

        return result;
    }

    /**
     * 
     * @param {Request} req 
     * @param {Response} res
     */
    async #serverHandler(req, res) {
        req.server = this;

        const middlewares = this.#getMiddlewares(req);

        if (!middlewares) return this.#notFoundHandler(req, res);

        try {
            await callMiddlewares(req, res, ...middlewares);
        } catch(err) {
            res.status(500);
            res.end();
        }
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

    await (middlewares[0](req, res, next));
}


/**
 * @param {Request} req
 * @param {Response} res
 * @param {Middleware[]} middlewares 
 * @param {number} index 
 * @returns {Function}
 */
function getNext(req, res, middlewares, index) {
    return async function () {
        if (typeof middlewares[index + 1] === "function") {
            const next = getNext(req, res, middlewares, index + 1);

            return await middlewares[index + 1](req, res, next);
        }
    }
}

