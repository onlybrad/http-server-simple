const assert = require("assert");
const fs = require("fs");
const path = require("path");
const {Server, Request, Response, File, Download} = require("../src/index.js");

describe("Server", async function () {
    /** @type {Server} */
    const server = await startServer(5001, allPreparations);
    after(function() {
        this.timeout(0);
        server.close()
    });

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
        describe("#get", () => {
            it("should create a GET '/test1' endpoint that returns the text 'test'", async () => {
                const res = await fetch("http://127.0.0.1:5001/test1");
                const text = await res.text();
                assert.strictEqual(text, "test");
            });
        });
        describe("#post", () => {
            it("should create a POST '/test1' endpoint that returns the text 'test'", async () => {
                const res = await fetch("http://127.0.0.1:5001/test1", {
                    method: "POST"
                });
                const text = await res.text();
                assert.strictEqual(text, "test");
            });
        });
        describe("#put", () => {
            it("should create a PUT '/test1' endpoint that returns the text 'test'", async () => {
                const res = await fetch("http://127.0.0.1:5001/test1", {
                    method: "PUT"
                });
                const text = await res.text();
                assert.strictEqual(text, "test");
            });
        });
        describe("#patch", () => {
            it("should create a PATCH '/test1' endpoint that returns the text 'test'", async () => {
                const res = await fetch("http://127.0.0.1:5001/test1", {
                    method: "PATCH"
                });
                const text = await res.text();
                assert.strictEqual(text, "test");
            });
        });
        describe("#delete", function () {
            it("should create a DELETE '/test1' endpoint that returns the text 'test'", async () => {
                const res = await fetch("http://127.0.0.1:5001/test1", {
                    method: "DELETE"
                });
                const text = await res.text();
                assert.strictEqual(text, "test");
            });
        });
    });
    describe("Extract query parameters from all method types.", () => {
        describe("#get", () => {
            it("should create a GET '/test2' endpoint that returns the query parameters passed in the url", async () => {
                const res = await fetch("http://127.0.0.1:5001/test2?a=1&b=2");
                const text = await res.text();
                assert.strictEqual(text, "1 2");
            });
        });
        describe("#post", () => {
            it("should create a POST '/test2' endpoint that returns the query parameters passed in the url", async () => {
                const res = await fetch("http://127.0.0.1:5001/test2?a=1&b=2", {
                    method: "POST"
                });
                const text = await res.text();
                assert.strictEqual(text, "1 2");
            });
        });
        describe("#put", () => {
            it("should create a PUT '/test2' endpoint that returns the query parameters passed in the url", async () => {
                const res = await fetch("http://127.0.0.1:5001/test2?a=3&b=4", {
                    method: "PUT"
                });
                const text = await res.text();
                assert.strictEqual(text, "3 4");
            });
        });
        describe("#patch", () => {
            it("should create a PATCH '/test2' endpoint that returns the query parameters passed in the url", async () => {
                const res = await fetch("http://127.0.0.1:5001/test2?a=5&b=a", {
                    method: "PATCH"
                });
                const text = await res.text();
                assert.strictEqual(text, "5 a");
            });
        });
        describe("#delete", () => {
            it("should create a DELETE '/test2' endpoint that returns the query parameters passed in the url", async () => {
                const res = await fetch("http://127.0.0.1:5001/test2?a=8&b=9", {
                    method: "DELETE"
                });
                const text = await res.text();
                assert.strictEqual(text, "8 9");
            });
        });
    });
    describe("Extract route parameters from all method types.", () => {
        describe("#get", () => {
            it("should create a GET '/test3/:a/:b' endpoint that returns the route parameters passed in the url", async () => {
                const res = await fetch("http://127.0.0.1:5001/test3/1/2");
                const text = await res.text();
                assert.strictEqual(text, "1 2");
            });
        });
        describe("#post", () => {
            it("should create a POST '/test3/:a/:b' endpoint that returns the route parameters passed in the url", async () => {
                const res = await fetch("http://127.0.0.1:5001/test3/3/hi", {
                    method: "POST"
                });
                const text = await res.text();
                assert.strictEqual(text, "3 hi");
            });
        });
        describe("#put", () => {
            it("should create a PUT '/test3/:a/:b' endpoint that returns the route parameters passed in the url", async () => {
                const res = await fetch("http://127.0.0.1:5001/test3/a/55", {
                    method: "PUT"
                });
                const text = await res.text();
                assert.strictEqual(text, "a 55");
            });
        });
        describe("#patch", () => {
            it("should create a PATCH '/test3/:a/:b' endpoint that returns the route parameters passed in the url", async () => {
                const res = await fetch("http://127.0.0.1:5001/test3/welcome/3", {
                    method: "PATCH"
                });
                const text = await res.text();
                assert.strictEqual(text, "welcome 3");
            });
        });
        describe("#delete", () => {
            it("should create a DELETE '/test3/:a/:b' endpoint that returns the route parameters passed in the url", async () => {
                const res = await fetch("http://127.0.0.1:5001/test3/No/6", {
                    method: "DELETE"
                });
                const text = await res.text();
                assert.strictEqual(text, "No 6");
            });
        });
    });
    describe("Select the correct route", () => {
        it("should select the /test4/first route.", async () => {
            const res = await fetch("http://127.0.0.1:5001/test4/first");
            const text = await res.text();
            assert.strictEqual(text, "/test4/first");
        });
        it("should select the /test4/first/second route.", async () => {
            const res = await fetch("http://127.0.0.1:5001/test4/first/second");
            const text = await res.text();
            assert.strictEqual(text, "/test4/first/second");
        });
        it("should select the /test4/first/second/third route.", async () => {
            const res = await fetch("http://127.0.0.1:5001/test4/first/second/third");
            const text = await res.text();
            assert.strictEqual(text, "/test4/first/second/third");
        });
    });
    describe("Unhandled exception", () => {
        it("should return status code 500 if there are unhandled exception in middlewares or handlers", async () => {
            const res = await fetch("http://127.0.0.1:5001/exception");

            assert.strictEqual(res.status,500);
        });
    });
    describe("Body parser", () => {
        describe("Only requests with the POST, PUT and PATCH methods have access to the body.", () => {
            it("req.body should return undefined for a GET request", async () => {
                const res = await fetch("http://127.0.0.1:5001/test5");
                const text = await res.text();
                assert.strictEqual(text, "undefined");
            });
            it("req.body should return undefined for a DELETE request", async () => {
                const res = await fetch("http://127.0.0.1:5001/test5", {
                    method: "DELETE",
                    body: "text"
                });
                const text = await res.text();
                assert.strictEqual(text, "undefined");
            });
            it("req.body should return the text sent in the body for a POST request", async () => {
                try {
                    const res = await fetch("http://127.0.0.1:5001/test5", {
                        method: "POST",
                        body: "text"
                    });
    
                    const text = await res.text();
    
                    assert.strictEqual(text, "text");
                } catch(err) {
                    console.error(err);
                    throw err;
                }

            });
            it("req.body should return the text sent in the body for a PUT request", async () => {
                const res = await fetch("http://127.0.0.1:5001/test5", {
                    method: "PUT",
                    body: "text"
                });
                const text = await res.text();
                assert.strictEqual(text, "text");
            });
            it("req.body should return the text sent in the body for a PATCh request", async () => {
                const res = await fetch("http://127.0.0.1:5001/test5", {
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
                const res = await fetch("http://127.0.0.1:5001/test5", {
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
                const res = await fetch("http://127.0.0.1:5001/test5", {
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
                const res = await fetch("http://127.0.0.1:5001/test5", {
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
                const res = await fetch("http://127.0.0.1:5001/test5", {
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
                formData.append("a", "1");
                formData.append("b", "2");

                const expected = JSON.stringify(Object.fromEntries(formData));

                const res = await fetch("http://127.0.0.1:5001/test5", {
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
                formData.append("a", "1");
                formData.append("b", "2");

                const expected = JSON.stringify(Object.fromEntries(formData));

                const res = await fetch("http://127.0.0.1:5001/test5", {
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
                formData.append("a", "1");
                formData.append("b", "2");

                const expected = JSON.stringify(Object.fromEntries(formData));

                //NOTE: fetch will automatically assign the correct Content-Type and correct boundary
                const res = await fetch("http://127.0.0.1:5001/test5", {
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

                formData.append("a", "1");
                formData.append("file", blob, "dummy.txt");

                const expected = JSON.stringify({ a: "1", file: file.toString() });

                const res = await fetch("http://127.0.0.1:5001/test5", {
                    method: "POST",
                    body: formData,
                });
                const text = await res.text();
                assert.strictEqual(text, expected);
            });
        });
    });
    describe("Download", () => {
        const file = fs.readFileSync(path.resolve(__dirname,"dummy.txt")).toString();
        describe("Download with the 'low level' res.download method", () => {
            it("should return the whole file if only the file is passed as a parameter and status code 200", async () => {
                const expected = file;
                const res = await fetch("http://127.0.0.1:5001/test6/res.download");
                const text = await res.text();
                assert.strictEqual(text, expected);
                assert.strictEqual(res.status, 200);
            });
            it("should return everything from after the specified start position and status code 206", async () => {
                const start = 2;
                const expected = fs.readFileSync(path.resolve(__dirname,"dummy.txt")).toString().substring(start);
                const res = await fetch(`http://127.0.0.1:5001/test6/res.download?start=${start}`);
                const text = await res.text();
                assert.strictEqual(text,expected);
                assert.strictEqual(res.status, 206);
            });
            it("should return everything from the start to the specified end position and status code 206", async () => {
                const end = 5;
                const expected = file.substring(0,end+1);
                const res = await fetch(`http://127.0.0.1:5001/test6/res.download?end=${end}`);
                const text = await res.text();
                assert.strictEqual(text,expected);
                assert.strictEqual(res.status, 206);
            });
            it("should return everything between the specified start and end position and status code 206", async () => {
                const start = 2;
                const end = 5;
                const expected = file.substring(start,end+1);
                const res = await fetch(`http://127.0.0.1:5001/test6/res.download?start=${start}&end=${end}`);
                const text = await res.text();

                assert.strictEqual(text,expected);
                assert.strictEqual(res.status, 206);
            });
            it("should return status code 416 if start is greater than end", async() => {
                const start = 10;
                const end = start-1;

                const res = await fetch(`http://127.0.0.1:5001/test6/res.download?start=${start}&end=${end}`);
                
                assert.strictEqual(res.status, 416);
            });
            it("should return status code 416 if start+1 is greater than the file size in bytes", async() => {
                const start = file.length;
                const res = await fetch(`http://127.0.0.1:5001/test6/res.download?start=${start}`);
                
                assert.strictEqual(res.status, 416);
            });
            it("should return status code 416 if end+1 is greater than the file size in bytes", async() => {
                const end = file.length;
                const res = await fetch(`http://127.0.0.1:5001/test6/res.download?end=${end}`);
                
                assert.strictEqual(res.status, 416);
            });
            it("should return status code 416 if end+1 and start+1 are greater than the file size in bytes", async() => {
                const start = file.length;
                const end = start;
                                
                const res = await fetch(`http://127.0.0.1:5001/test6/res.download?start=${start}&end=${end}`);
                
                assert.strictEqual(res.status, 416);
            });
            it("should return status code 200 if start is equal to 0 and end+1 is equal to the file size in bytes", async () => {
                const start = 0;
                const end = file.length - 1;
                const res = await fetch(`http://127.0.0.1:5001/test6/res.download?start=${start}&end=${end}`);
                
                assert.strictEqual(res.status, 200);
            });
            it("should return status code 200 if start is unspecified and end+1 is equal to the file size in bytes", async () => {
                const end = file.length - 1;
                const res = await fetch(`http://127.0.0.1:5001/test6/res.download?end=${end}`);
                
                assert.strictEqual(res.status, 200);
            });
            it("should return status code 200 if start is 0 and end is unspecified", async () => {
                const start = 0;
                const res = await fetch(`http://127.0.0.1:5001/test6/res.download?start=${start}`);
                
                assert.strictEqual(res.status, 200);
            });
        });
        describe("Download with the 'high level' Download class helper", () => {
            it("should return the whole file and status code 200 if downloader.download is called", async () => {
                const expected = file;
                const res = await fetch("http://127.0.0.1:5001/test6/downloader.download");
                const text = await res.text();

                assert.strictEqual(text,expected);
                assert.strictEqual(res.status, 200);
            });
            it("should return everything between the specified start in the Range header and the end and status code 206 if downloader.resumableDownload is called", async() => {
                const start = 4;
                const expected = file.substring(4);
                const res = await fetch("http://127.0.0.1:5001/test6/downloader.resumableDownload", {
                    headers: {
                        "Range": `bytes=${start}-`
                    }
                });
                const text = await res.text();

                assert.strictEqual(text,expected);
                assert.strictEqual(res.status, 206);
            });
            it("should return everything between the specified start and the specified end in the Range header and status code 206 if downloader.resumableDownload is called", async() => {
                const start = 3;
                const end = 10;
                const expected = file.substring(start,end+1);
                const res = await fetch("http://127.0.0.1:5001/test6/downloader.resumableDownload", {
                    headers: {
                        "Range": `bytes=${start}-${end}`
                    }
                });
                const text = await res.text();

                assert.strictEqual(text,expected);
                assert.strictEqual(res.status, 206);
            });
            it("should return everything from the start to the length (length < file size) specified in the suffix length Range header and status code 206 if downloader.resumableDownload is called", async() => {
                const suffixLength = 7;
                const expected = file.substring(0,suffixLength);

                const res = await fetch("http://127.0.0.1:5001/test6/downloader.resumableDownload", {
                    headers: {
                        "Range": `bytes=-${suffixLength}`
                    }
                });
                const text = await res.text();

                assert.strictEqual(text,expected);
                assert.strictEqual(res.status, 206);

            });
            it("should return everything from the start to the length (length = file size) specified in the suffix length Range header and status code 200 if downloader.resumableDownload is called", async() => {
                const suffixLength = file.length;
                const expected = file;

                const res = await fetch("http://127.0.0.1:5001/test6/downloader.resumableDownload", {
                    headers: {
                        "Range": `bytes=-${suffixLength}`
                    }
                });
                const text = await res.text();

                assert.strictEqual(text,expected);
                assert.strictEqual(res.status, 200);
            });
            it("should return status code 416 if the length specified in the suffix length Range header is greater than the file size and downloader.resumableDownload is called", async() => {
                const suffixLength = file.length + 1;

                const res = await fetch("http://127.0.0.1:5001/test6/downloader.resumableDownload", {
                    headers: {
                        "Range": `bytes=-${suffixLength}`
                    }
                });
                assert.strictEqual(res.status, 416);
            });
        });
    });
});

/**
 * @param {number} port
 * @param {(server: Server) => void} [preparation] 
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
function allPreparations(server) {
    [
        returnTestPreparation,
        extractRouteParamsPreparation,
        extractQueryParamsPreparation,
        multipleRoutesPreparation,
        unhandledExceptionPreparation,
        bodyParserPreparation,
        downloadPreparation
    ]
    .forEach(fn => fn(server));
}

/**
 * 
 * @param {Server} server 
 */
function returnTestPreparation(server) {
    server.get("/test1", returnTestHandler)
        .post("/test1", returnTestHandler)
        .put("/test1", returnTestHandler)
        .patch("/test1", returnTestHandler)
        .delete("/test1", returnTestHandler);
}

/**
 * 
 * @param {Server} server 
 */
function extractQueryParamsPreparation(server) {
    server.get("/test2", extractQueryParamsHandler)
        .post("/test2", extractQueryParamsHandler)
        .put("/test2", extractQueryParamsHandler)
        .patch("/test2", extractQueryParamsHandler)
        .delete("/test2", extractQueryParamsHandler);
}

/**
 * 
 * @param {Server} server 
 */
 function extractRouteParamsPreparation(server) {
    server.get("/test3/:a/:b", extractRouteParamsHandler)
        .post("/test3/:a/:b", extractRouteParamsHandler)
        .put("/test3/:a/:b", extractRouteParamsHandler)
        .patch("/test3/:a/:b", extractRouteParamsHandler)
        .delete("/test3/:a/:b", extractRouteParamsHandler);
}

/**
 * 
 * @param {Server} server 
 */
function multipleRoutesPreparation(server) {
    server.get("/test4/first", returnPathnameHandler)
        .get("/test4/first/second", returnPathnameHandler)
        .get("/test4/first/second/third", returnPathnameHandler);
}

/**
 * 
 * @param {Server} server 
 */
function bodyParserPreparation(server) {
    server.get("/test5", returnBodyHandler)
        .post("/test5", returnBodyHandler)
        .put("/test5", returnBodyHandler)
        .patch("/test5", returnBodyHandler)
        .delete("/test5", returnBodyHandler);
}

/**
 * @param {Server} server 
 */
function unhandledExceptionPreparation(server) {
    // @ts-ignore
    server.get("/exception", (res,req) => res.nonExistantFunction());
}

/**
 * 
 * @param {Server} server 
 */
function downloadPreparation(server) {
    server.get("/test6/res.download", downloadFileHandler);
    server.get("/test6/downloader.download", downloadFileHandler);
    server.get("/test6/downloader.resumableDownload", downloadFileHandler);
}

/**
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
function returnTestHandler(req, res) {
    return res.text("test");
}

/**
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
function extractQueryParamsHandler(req, res) {
    return res.text(req.query("a") + " " + req.query("b"));
}

/**
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
function extractRouteParamsHandler(req, res) {
    return res.text(req.params.a + " " + req.params.b);
}

/**
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
function returnPathnameHandler(req, res) {
    return res.text(req.pathname);
}

/**
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
async function returnBodyHandler(req, res) {
    const body = req.body;

    if (typeof body === "object" && body !== null) {
        for (const [key, value] of Object.entries(body)) {
            if (value instanceof File) {
                body[key] = await value.read();
            }
        }
        return res.json(body);
    }

    //@ts-ignore
    return res.text(body || "undefined");
}

/**
 * @param {Request} req 
 * @param {Response} res 
 */
async function downloadFileHandler(req, res) {

    const file = new File(path.resolve(__dirname, "dummy.txt"));
    const file2 = new File(path.resolve(__dirname, "doesnt-exist.txt"));

    if(req.pathname.endsWith("/res.download")) {
        if(req.query("exists") === "0") {
            return res.download(file2);
        }
        if(!req.query("start") && !req.query("end")) {
            return res.download(file);
        } else {
            return res.download(file, {
                // @ts-ignore
                start: req.query("start") == null ? undefined : parseInt(req.query("start")), 
                // @ts-ignore
                end: req.query("end") == null ? undefined : parseInt(req.query("end"))
            }).catch(err => console.error(err));
        }
    } 
    
    const downloader = new Download(req,res);
    
    if(req.pathname.endsWith("/downloader.download")) {
        return downloader.download(file);
    } else if (req.pathname.endsWith("/downloader.resumableDownload")) {
        return downloader.resumableDownload(file);
    }

    return res.end();
}