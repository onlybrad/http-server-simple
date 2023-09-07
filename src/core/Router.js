/** @typedef {(request: import("./Request"), response: import("./Response"), next?: () => Promise<void>) => void} Middleware */
/** @typedef {{ path: string, params: Params, middlewares: Middleware[] }} RouteMiddlewares */
/** @typedef {Record<number,string>} Params */
/** @typedef {(router: Router) => void} PrefixCallback */

const { SUPPORTED_METHODS } = require("../util/types.js");

class Router {

    /** @type {Record<import("../util/types.js").Method,RouteMiddlewares[]>} */
    #routes;
    #prefix = "";

    constructor() {
        this.#initiateRoutesArray();
    }

    /**
     * @param {string} path
     * @param {Middleware[]} middlewares
     */
    get(path, ...middlewares) {
        this.addRoute("GET", path, ...middlewares);

        return this;
    }

    /**
     * @param {string} path
     * @param {Middleware[]} middlewares 
     */
    post(path, ...middlewares) {
        this.addRoute("POST", path, ...middlewares);

        return this;
    }

    /**
     * @param {string} path
     * @param {Middleware[]} middlewares 
     */
    put(path, ...middlewares) {
        this.addRoute("PUT", path, ...middlewares);

        return this;
    }

    /**
     * @param {string} path
     * @param {Middleware[]} middlewares 
     */
    patch(path, ...middlewares) {
        this.addRoute("PATCH", path, ...middlewares);

        return this;
    }

    /**
     * @param {string} path
     * @param {Middleware[]} middlewares 
     */
    delete(path, ...middlewares) {
        this.addRoute("DELETE", path, ...middlewares);

        return this;
    }

    /**
     * @param {string} path
     * @param {Middleware[]} middlewares 
     */
    head(path, ...middlewares) {
        this.addRoute("HEAD", path, ...middlewares);

        return this;
    }

    /**
     * @param {string} path
     * @param {Middleware[]} middlewares 
     */
    options(path, ...middlewares) {
        this.addRoute("OPTIONS", path, ...middlewares);

        return this;
    }

    /**
     * @param {string} path
     * @param {import("../util/types.js").Method} method
     * @returns {RouteMiddlewares | null}
     */
    findRoute(path, method) {
        if(!path.startsWith(this.#prefix)) {
            return null;
        }

        path = path.slice(this.#prefix.length);
        path = path.charAt(0) === "/" ? path : "/"+path;

        if(path !== "/") {
            path = path.endsWith("/") ? path.slice(0,-1) : path;
        }

        const routes = this.#routes[method];

        return routes.find(
            route => (
                route.path === path ||
                matchParams(route.path, path)
            )
        ) || null;
    }

    /**
     * @param {import("../util/types.js").Method} method
     * @param {string} path
     * @param {Middleware[]} middlewares 
     */
    addRoute(method, path, ...middlewares) {
        if (!path) {
            return;
        }

        if(path !== "/") {
            path = path.endsWith("/") ? path.slice(0,-1) : path;
        }

        const route = this.findRoute(path, method);
        const params = getParams(path);

        if (route) {
            route.path = path;
            route.middlewares = middlewares;
            route.params = params;
        } else {
            this.#routes[method].push({ path, middlewares, params });
        }
    }

    #initiateRoutesArray() {
        /** @type {Record<import("../util/types.js").Method,RouteMiddlewares[]>} */
        //@ts-ignore
        const routes = {};

        this.#routes = SUPPORTED_METHODS.reduce((routes, method) => {
            routes[method] = [];

            return routes;
        }, routes);
    }

    /**
     * 
     * @param {string} path 
     * @param {Params} routeParams 
     */
    getParams(path, routeParams) {
        path = path.slice(this.#prefix.length);

        const pathArr = path.split("/").splice(1);
        /** @type {Record<string,string>} */
        const params = {}

        Object.entries(routeParams).forEach(([i, param]) => {
            params[param] = pathArr[i];
        });

        return params;
    }

    /**
     * @param {string} prefix
     * @param {PrefixCallback} cb 
     */
    static prefix(prefix,cb) {
        const router = new this();
        router.#prefix = prefix;
        cb(router);

        return router;
    }
}

/**
 * 
 * @param {string} routerPath 
 * @param {string} path 
 */
function matchParams(routerPath, path) {
    const routerPathArray = routerPath.split("/").splice(1);
    const pathArray = path.split("/").splice(1);

    if(routerPathArray.length !== pathArray.length) {
        return false;
    }

    for(let i=0;i<routerPathArray.length;i++) {
        if(routerPathArray[i] !== pathArray[i] && !routerPathArray[i].startsWith(":")) {
            return false;
        }
    }

    return true;
}

/**
 * 
 * @param {string} path 
 */
function getParams(path) {
    /**@type {Params} */
    const params = {};

    path.split("/").splice(1).forEach((word,i) => {
        if(word.startsWith(":")) {
            params[i] = word.slice(1);
        }
    });

    return params;
}

module.exports = Router;