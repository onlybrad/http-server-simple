/** @typedef {"GET"|"POST"|"PUT"|"PATCH"|"DELETE"} Methods */
/** @typedef {function(import("./Request"), import("./Response"), function)} Middleware */
/** @typedef {{ path: string, params: Object<number,string>, middlewares: Middleware[] }} RouteMiddlewares */
/** @typedef {Object<number,string>} Params */
/** @typedef {function(Router)} PrefixCallback */

class Router {

    /** @type {RouteMiddlewares[]} */
    #routes = [];

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
     * @param {string} method
     * @returns {RouteMiddlewares | null}
     */
    findRoute(path, method) {
        if(!path.startsWith(this.#prefix)) return null;

        path = path.slice(this.#prefix.length);
        path = path.charAt(0) === "/" ? path : "/"+path;

        if(path !== "/") {
            path = path.endsWith("/") ? path.slice(0,-1) : path;
        }

        /** @type {RouteMiddlewares} */
        const routes = this.#routes[method];

        return routes.find(
            route => (
                route.path === path ||
                matchParams(route.path, path)
            )
        ) || null;
    }

    /**
     * @param {Methods} method
     * @param {string} path
     * @param {Middleware[]} middlewares 
     */
    addRoute(method, path, ...middlewares) {
        if (!methods.includes(method) || !path) {
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
        this.#routes = methods.reduce((routes, method) => {
            routes[method] = [];
            return routes;
        }, {});
    }

    /**
     * 
     * @param {string} path 
     * @param {Params} routeParams 
     */
    getParams(path, routeParams) {
        path = path.slice(this.#prefix.length);

        const pathArr = path.split("/").splice(1);
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

const methods = [
    "GET", "POST", "PUT", "PATCH", "DELETE"
]

/**
 * 
 * @param {string} routerPath 
 * @param {string} path 
 */
function matchParams(routerPath, path) {
    routerPath = routerPath.split("/").splice(1);
    path = path.split("/").splice(1);

    if(routerPath.length !== path.length) {
        return false;
    }

    for(let i=0;i<routerPath.length;i++) {
        if(routerPath[i] !== path[i] && !routerPath[i].startsWith(":")) {
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