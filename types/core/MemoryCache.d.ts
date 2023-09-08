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
    has(key: string): boolean;
    /**
     * @param {string} key
     */
    delete(key: string): void;
    /**
     * @param {string} key
     */
    get(key: string): T;
    #private;
}
//# sourceMappingURL=MemoryCache.d.ts.map