export = MemoryCache;
/**
 * @template T
 */
declare class MemoryCache<T> {
    /**
     * @param {string} key
     * @param {T} value
     */
    add(key: string, value: T): void;
    /**
     * @param {string} key
     */
    has(key: string): any;
    /**
     * @param {string} key
     */
    delete(key: string): void;
    /**
     * @param {string} key
     */
    get(key: string): any;
    #private;
}
//# sourceMappingURL=MemoryCache.d.ts.map