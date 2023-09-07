module.exports = 

/**
 * @template T
 */
class MemoryCache {

    /** @type {Map<string,T>} */
    #cache = new Map();

    /**
     * @param {string} key 
     * @param {T} value 
     */
    add(key, value) {
        this.#cache.set(key,value);
    }

    /**
     * @param {string} key 
     */
    has(key) {
        return this.#cache.has(key);
    }

    /**
     * @param {string} key 
     */
    delete(key) {
        this.#cache.delete(key);
    }

    /**
     * @param {string} key 
     */
    get(key) {
        return this.#cache.get(key);
    }
}