/**
 * @param {string} str
 * @return {str is BufferEncoding}
 */
export function isBufferEncoding(str: string): str is BufferEncoding;
/**
 * @param {string} str
 * @return {str is import("./types.js").Method}
 */
export function isSupportedMethod(str: string): str is "GET" | "POST" | "PUT" | "PATCH" | "HEAD" | "OPTIONS" | "DELETE";
/**
 * @param {unknown} str
 * @return {str is string}
 */
export function isString(str: unknown): str is string;
//# sourceMappingURL=guard.d.ts.map