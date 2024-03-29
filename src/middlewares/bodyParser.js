/** @typedef {{ parseJson: boolean, parseUrlEncoded: boolean, parseFormData: boolean }} BodyParserOptions */
/** @typedef {import("../core/Request")} Request */
/** @typedef {import("../core/Response")} Response */

const { isBufferEncoding } = require("../util/guard.js");

const APPLICATION_JSON = "application/json";
const URLENCODED = "application/x-www-form-urlencoded";
const FORMDATA = "multipart/form-data";

/** @type {BodyParserOptions} */
const defaultOptions = {
    parseJson: true,
    parseUrlEncoded: true,
    parseFormData: true,
}

module.exports =

function ({ parseJson, parseUrlEncoded, parseFormData } = defaultOptions) {
    /**
     * @param {Request} req 
     * @param {Response} res
     * @param {() => Promise<void>} next 
     */
    return function bodyParser(req, res, next) {
        if (!["PUT", "POST", "PATCH"].includes(req.method || "")) {
            return next();
        }

        switch (req.contentType) {
            case APPLICATION_JSON: if (!parseJson) {
                return next();
            } break;
            case URLENCODED: if (!parseUrlEncoded) {
                return next();
            } break;
            case FORMDATA: if (!parseFormData) {
                return next();
            } 
            
            req.setEncoding('latin1'); break;
        }

        //TODO: make this work with very large bodies
        let body = "";

        req.on("data", chunk => body += chunk)
            .on("end", async () => {
                req.body = await parseBody(req, body);
                next();
            });
    }
}

/**
 * 
 * @param {Request} req 
 * @param {string} body 
 */
async function parseBody(req, body) {
    try {
        switch (req.contentType) {
            case APPLICATION_JSON:
                return JSON.parse(body);
            case URLENCODED:
                return Object.fromEntries(new URLSearchParams(body));
            case FORMDATA:
                return await parseFormData(req, body);
            default:
                return body.toString();
        }
    } catch (err) {
        return body.toString();
    }
}

/**
 * @param {Request} req
 * @param {string} body
 */
async function parseFormData(req, body) {   
    const end = "--" + req.boundary + "--";

    if (!req.boundary || !body.endsWith(end)) {
        throw new Error();
    }

    const contents = body.split("--" + req.boundary).map(el => el.trim());
    contents.shift();
    contents.pop();

    const parsedBody = {};

    for (let content of contents) {
        const match = content.match(/Content-Disposition: form-data; name="([^"]+)"(?:; filename="([^"]+)")?(?:\r\nContent-Type: (.+))?\r\n\r\n([\s\S]+)/);

        if (!match) throw new Error();

        const [, name, filename, contentType, value] = match;

        if(filename) {
            parsedBody[name] = await req.server.temp.createFile(filename, value)
        } else {
            parsedBody[name] = isBufferEncoding(req.charset) ?
                Buffer.from(value, 'latin1').toString(req.charset) :
                undefined;
        }
    }

    return parsedBody;
}