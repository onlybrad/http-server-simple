const assert = require("assert");
const fs = require("fs");
const path = require("path");
const Server = require("../src/core/Server");
const File = require("../src/util/File");

/** @typedef {import("../src/core/Server")} Server */
/** @typedef {import("../src/core/Request")} Request */
/** @typedef {import("../src/core/Response")} Response */

describe("Server", function () {
    describe("Starting and closing the server", () => {
        /** @type {Server} */
        let server;
        describe("#listen", () => {
            it("Starting the server.", async () => {
                server = await startServer(5000);
            });
        });
        describe("#close", () => {
            it("Closing the server.", async () =>
                await server.close()
            );
        });
    });
    describe("Return text response from all method types.", () => {
        /** @type {Server} */
        let server;
        describe("#get", () => {
            it("should create a GET '/' endpoint that returns the text 'test'", async () => {
                server = await startServer(5001, returnTestPreparation);
                const res = await fetch("http://127.0.0.1:5001");
                const text = await res.text();
                assert.strictEqual(text, "test");
            });
        });
        describe("#post", () => {
            it("should create a POST '/' endpoint that returns the text 'test'", async () => {
                const res = await fetch("http://127.0.0.1:5001", {
                    method: "POST"
                });
                const text = await res.text();
                assert.strictEqual(text, "test");
            });
        });
        describe("#put", () => {
            it("should create a PUT '/' endpoint that returns the text 'test'", async () => {
                const res = await fetch("http://127.0.0.1:5001", {
                    method: "PUT"
                });
                const text = await res.text();
                assert.strictEqual(text, "test");
            });
        });
        describe("#patch", () => {
            it("should create a PATCH '/' endpoint that returns the text 'test'", async () => {
                const res = await fetch("http://127.0.0.1:5001", {
                    method: "PATCH"
                });
                const text = await res.text();
                assert.strictEqual(text, "test");
            });
        });
        describe("#delete", function () {
            it("should create a DELETE '/' endpoint that returns the text 'test'", async () => {
                const res = await fetch("http://127.0.0.1:5001", {
                    method: "DELETE"
                });
                const text = await res.text();
                server.close();
                assert.strictEqual(text, "test");
            });
        });
    });
    describe("Extract query parameters from all method types.", () => {
        /** @type {Server} */
        let server;
        describe("#get", () => {
            it("should create a GET '/' endpoint that returns the query parameters passed in the url", async () => {
                server = await startServer(5002, extractQueryParamsPreparation);
                const res = await fetch("http://127.0.0.1:5002?a=1&b=2");
                const text = await res.text();
                assert.strictEqual(text, "1 2");
            });
        });
        describe("#post", () => {
            it("should create a POST '/' endpoint that returns the query parameters passed in the url", async () => {
                const res = await fetch("http://127.0.0.1:5002?a=1&b=2", {
                    method: "POST"
                });
                const text = await res.text();
                assert.strictEqual(text, "1 2");
            });
        });
        describe("#put", () => {
            it("should create a PUT '/' endpoint that returns the query parameters passed in the url", async () => {
                const res = await fetch("http://127.0.0.1:5002?a=3&b=4", {
                    method: "PUT"
                });
                const text = await res.text();
                assert.strictEqual(text, "3 4");
            });
        });
        describe("#patch", () => {
            it("should create a PATCH '/' endpoint that returns the query parameters passed in the url", async () => {
                const res = await fetch("http://127.0.0.1:5002?a=5&b=a", {
                    method: "PATCH"
                });
                const text = await res.text();
                assert.strictEqual(text, "5 a");
            });
        });
        describe("#delete", () => {
            it("should create a DELETE '/' endpoint that returns the query parameters passed in the url", async () => {
                const res = await fetch("http://127.0.0.1:5002?a=8&b=9", {
                    method: "DELETE"
                });
                const text = await res.text();
                server.close();
                assert.strictEqual(text, "8 9");
            });
        });
    });
    describe("Extract route parameters from all method types.", () => {
        /** @type {Server} */
        let server;
        describe("#get", () => {
            it("should create a GET '/' endpoint that returns the route parameters passed in the url", async () => {
                server = await startServer(5003, extractRouteParamsPreparation);
                const res = await fetch("http://127.0.0.1:5003/1/2");
                const text = await res.text();
                assert.strictEqual(text, "1 2");
            });
        });
        describe("#post", () => {
            it("should create a POST '/' endpoint that returns the route parameters passed in the url", async () => {
                const res = await fetch("http://127.0.0.1:5003/3/hi", {
                    method: "POST"
                });
                const text = await res.text();
                assert.strictEqual(text, "3 hi");
            });
        });
        describe("#put", () => {
            it("should create a PUT '/' endpoint that returns the route parameters passed in the url", async () => {
                const res = await fetch("http://127.0.0.1:5003/a/55", {
                    method: "PUT"
                });
                const text = await res.text();
                assert.strictEqual(text, "a 55");
            });
        });
        describe("#patch", () => {
            it("should create a PATCH '/' endpoint that returns the route parameters passed in the url", async () => {
                const res = await fetch("http://127.0.0.1:5003/welcome/3", {
                    method: "PATCH"
                });
                const text = await res.text();
                assert.strictEqual(text, "welcome 3");
            });
        });
        describe("#delete", () => {
            it("should create a DELETE '/' endpoint that returns the route parameters passed in the url", async () => {
                const res = await fetch("http://127.0.0.1:5003/No/6", {
                    method: "DELETE"
                });
                const text = await res.text();
                server.close();
                assert.strictEqual(text, "No 6");
            });
        });
    });
    describe("Select the correct route", () => {
        /** @type {Server} */
        let server;
        it("should select the /first route.", async () => {
            server = await startServer(5004, multipleRoutesPreparation);
            const res = await fetch("http://127.0.0.1:5004/first");
            const text = await res.text();
            assert.strictEqual(text, "/first");
        });
        it("should select the /first/second route.", async () => {
            const res = await fetch("http://127.0.0.1:5004/first/second");
            const text = await res.text();
            assert.strictEqual(text, "/first/second");
        });
        it("should select the /first/second/third route.", async () => {
            const res = await fetch("http://127.0.0.1:5004/first/second/third");
            const text = await res.text();
            server.close();
            assert.strictEqual(text, "/first/second/third");
        });
    });
    describe("Body parser", () => {
        /** @type {Server} */
        let server;
        describe("Only requests with the POST, PUT and PATCH methods have access to the body.", () => {
            it("req.body should return undefined for a GET request", async () => {
                server = await startServer(5005, bodyParserPreparation, {
                    body: "text"
                });
                const res = await fetch("http://127.0.0.1:5005");
                const text = await res.text();
                assert.strictEqual(text, "undefined");
            });
            it("req.body should return undefined for a DELETE request", async () => {
                const res = await fetch("http://127.0.0.1:5005", {
                    method: "DELETE",
                    body: "text"
                });
                const text = await res.text();
                assert.strictEqual(text, "undefined");
            });
            it("req.body should return the text sent in the body for a POST request", async () => {
                const res = await fetch("http://127.0.0.1:5005", {
                    method: "POST",
                    body: "text"
                });
                const text = await res.text();
                assert.strictEqual(text, "text");
            });
            it("req.body should return the text sent in the body for a PUT request", async () => {
                const res = await fetch("http://127.0.0.1:5005", {
                    method: "PUT",
                    body: "text"
                });
                const text = await res.text();
                assert.strictEqual(text, "text");
            });
            it("req.body should return the text sent in the body for a PATCh request", async () => {
                const res = await fetch("http://127.0.0.1:5005", {
                    method: "PATCH",
                    body: "text"
                });
                const text = await res.text();
                assert.strictEqual(text, "text");
            });
        });
        describe("The Content-Type header should determine how the body is parsed.", () => {
            it("Invalid json with Content-Type: application/json should be parsed as plain text", async () => {
                const body = "invalid-json";
                const res = await fetch("http://127.0.0.1:5005", {
                    method: "POST",
                    body,
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                const text = await res.text();
                assert.strictEqual(text, body);
            });
            it("Valid json with Content-Type: application/json should be parsed as json", async () => {
                const json = JSON.stringify({ validJson: true });
                const res = await fetch("http://127.0.0.1:5005", {
                    method: "POST",
                    body: json,
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                const text = await res.text();
                assert.strictEqual(text, json);
            });
            it("Valid urlencoded string with Content-Type: application/x-www-form-urlencoded should be parsed as urlencoded string", async () => {
                const res = await fetch("http://127.0.0.1:5005", {
                    method: "POST",
                    body: "a=1&b=2",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                });
                const text = await res.text();
                assert.strictEqual(text, '{"a":"1","b":"2"}');
            });
            it("Invalid Form Data with Content-Type: multipart/form-data should be parsed as plain text", async () => {
                const body = "invalid-form-data";
                const res = await fetch("http://127.0.0.1:5005", {
                    method: "POST",
                    body,
                    headers: {
                        "Content-Type": "multipart/form-data; boundary=test"
                    }
                });
                const text = await res.text();
                assert.strictEqual(text, body);
            });
            it("Valid Form Data with no boundary passed to Content-Type: multipart/form-data should parse the body as plain text.", async () => {
                const formData = new FormData();
                formData.append("a", 1);
                formData.append("b", 2);

                const expected = JSON.stringify(Object.fromEntries(formData));

                const res = await fetch("http://127.0.0.1:5005", {
                    method: "POST",
                    body: formData,
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                });
                const text = await res.text();
                assert.notStrictEqual(text, expected);
            });
            it("Valid Form Data with wrong boundary passed to Content-Type: multipart/form-data should parse the body as plain text.", async () => {
                const formData = new FormData();
                formData.append("a", 1);
                formData.append("b", 2);

                const expected = JSON.stringify(Object.fromEntries(formData));

                const res = await fetch("http://127.0.0.1:5005", {
                    method: "POST",
                    body: formData,
                    headers: {
                        "Content-Type": "multipart/form-data; boundary=wrongboundary"
                    }
                });
                const text = await res.text();
                assert.notStrictEqual(text, expected);
            });
            it("Valid Form Data with Content-Type: multipart/form-data and valid boundary should be parsed as Form Data", async () => {
                const formData = new FormData();
                formData.append("a", 1);
                formData.append("b", 2);

                const expected = JSON.stringify(Object.fromEntries(formData));

                //NOTE: fetch will automatically assign the correct Content-Type and correct boundary
                const res = await fetch("http://127.0.0.1:5005", {
                    method: "POST",
                    body: formData,
                });
                const text = await res.text();
                assert.strictEqual(text, expected);
            });
            it("File sent with valid Form Data should be stored in a temp directory.", async () => {
                const file = fs.readFileSync(path.resolve(__dirname, "dummy.txt"));
                const blob = new Blob([file]);
                const formData = new FormData();

                formData.append("a", 1);
                formData.append("file", blob, "dummy.txt");

                const expected = JSON.stringify({ a: "1", file: file.toString() });

                const res = await fetch("http://127.0.0.1:5005", {
                    method: "POST",
                    body: formData,
                });
                const text = await res.text();
                assert.strictEqual(text, expected);
            });
        });
    });
});

/**
 * @param {number} port
 * @param {function(Server)} preparation 
 * @return {Promise<Server>}
 */
async function startServer(port, preparation) {
    const server = new Server();

    if (typeof preparation === "function") {
        preparation(server);
    }

    await server.listen(port, "127.0.0.1");

    return server;
}

/**
 * 
 * @param {Server} server 
 */
function returnTestPreparation(server) {
    server.get("/", returnTest)
        .post("/", returnTest)
        .put("/", returnTest)
        .patch("/", returnTest)
        .delete("/", returnTest);
}

/**
 * 
 * @param {Server} server 
 */
function extractRouteParamsPreparation(server) {
    server.get("/:a/:b", extractRouteParams)
        .post("/:a/:b", extractRouteParams)
        .put("/:a/:b", extractRouteParams)
        .patch("/:a/:b", extractRouteParams)
        .delete("/:a/:b", extractRouteParams);
}

/**
 * 
 * @param {Server} server 
 */
function extractQueryParamsPreparation(server) {
    server.get("/", extractQueryParams)
        .post("/", extractQueryParams)
        .put("/", extractQueryParams)
        .patch("/", extractQueryParams)
        .delete("/", extractQueryParams);
}

/**
 * 
 * @param {Server} server 
 */
function multipleRoutesPreparation(server) {
    server.get("/first", returnPathname)
        .get("/first/second", returnPathname)
        .get("/first/second/third", returnPathname);
}

/**
 * 
 * @param {Server} server 
 */
function bodyParserPreparation(server) {
    server.get("/", returnBody)
        .post("/", returnBody)
        .put("/", returnBody)
        .patch("/", returnBody)
        .delete("/", returnBody);
}

/**
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
function returnTest(req, res) {
    return res.text("test");
}

/**
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
function extractQueryParams(req, res) {
    return res.text(req.query("a") + " " + req.query("b"));
}

/**
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
function extractRouteParams(req, res) {
    return res.text(req.params.a + " " + req.params.b);
}

/**
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
function returnPathname(req, res) {
    return res.text(req.pathname);
}

/**
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
async function returnBody(req, res) {
    const body = req.body;

    if (typeof body === "object" && body !== null) {
        for ([key, value] of Object.entries(body)) {
            if (value instanceof File) {
                body[key] = await value.read();
            }
        }
        return res.json(body);
    }

    return res.text(body || "undefined");
}