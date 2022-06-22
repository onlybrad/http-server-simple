module.exports = 

class MemoryCache {

    #cache = {};

    add(key, value) {
        this.#cache[key] = value;
    }

    has(key) {
        return key in this.#cache;
    }

    delete(key) {
        delete this.#cache[key];
    }

    get(key) {
        return this.#cache[key];
    }

    /**
     * 
     * @param {string} key 
     * @param {function} cb 
     * 
     */
    remember(key, cb) {
        if(typeof cb !== "function") return;
        
        if(this.has(key)) return this.get(key);

        const value = cb();

        this.add(key, value);

        return value;
    }
}