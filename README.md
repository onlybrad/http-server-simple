http-server-simple is an http server written in pure javascript for NodeJS. It has no dependencies. The syntaxe was inspired by the Express library.

The following methods are supported: GET, HEAD, OPTIONS, POST, PUT, PATCH, DELETE.

## Usage

```javascript
const {Server} = require("http-server-simple");
const server = new Server();

/* GET 127.0.0.1:5000/text */
server.get("/text", (req,res) => {
    return res.text("Sending a text/plain message");
})
/* GET 127.0.0.1:5000/json */
.get("/json", (req,res) => {
    return res.json({message: "Sending an application/json message"});
})
/* GET 127.0.0.1:5000/html */
.get("/html", (req,res) => {
    return res.html("<h1>Sending a text/html message</h1>");
})
/* POST 127.0.0.1:5000/ */
.post("/", (req,res) => {
    return res.text("A post request to /");
})
.listen(5000, "127.0.0.1");

```

## Router

Server level routing done in the previous example will implicitly create a router with the "/" root, you can create your own router with a different root

```javascript

const {Server, Router} = require("http-server-simple");
const server = new Server();
const router = new Router();
const users = require("./data/users");

/* GET 127.0.0.1:5000/user */
router.get("/", (req,res) => {
    return res.json(users);
})
/* GET 127.0.0.1:5000/user/:id */
.get("/:id", (req,res) => {
    const id = req.params.id;
    return res.json(user.id);
})
/* DELETE 127.0.0.1:5000/user/:id */
.delete("/:id", (req,res) => {
    const id = req.params.id;
    delete user.id;
    return res.end();
});

server.router("/user",router).listen(5000,"127.0.0.1");

```

## Router prefix

In order to create routes within the router with the same prefix without having to repeat the prefix in each route, you can use Router.prefix()

```javascript
const {Server, Router} = require("http-server-simple");
const server = new Server();
const router = new Router();
const users = require("./data/users");
const posts = require("./data/posts");

const userRouter = Router.prefix("/user", router => {
    /* GET 127.0.0.1:5000/api/v1/user */
    router.get("/", (req,res) => res.json(users))

    /* GET 127.0.0.1:5000/api/v1/user/:id */
    .get("/:id", (req,res) => res.json(users[req.params.id]));
});

const postRouter = Router.prefix("/post", router => {
    /* GET 127.0.0.1:5000/api/v1/post */
    router.get("/", (req,res) => res.json(posts))

    /* GET 127.0.0.1:5000/api/v1/post/:id */
    .get("/:id", (req,res) => res.json(posts[req.params.id]));
});


server.router("/api/v1",[userRouter, postRouter])
    .listen(5000,"127.0.0.1");

```

## Middleware

Route handlers are considered middlewares too. The only difference between a middleware and a handler is the use of the next function. Handlers do not use the next function, middlewares do. Not calling next in the middle of the middleware chain will hang the server. To exit a middleware chain you have to return res.text(), res.html(), res.json() or res.end()

```javascript 

const {Server, Router} = require("http-server-simple");
const server = new Server();
const router = new Router();

server.router("/router",router,(req,res,next) => {
    console.log("Router middlewares will execute before routes middlewares.");
    next();
}).listen(5000,"127.0.0.1");

/* 127.0.0.1:5000/router/get */
router.get("/get",
(req,res,next) => {
    console.log("Route middlewares execute after the router middlewares.");

    if(Math.random() < 0.5) {
        console.log("Call the next middleware.");
        return next();
    } 

    console.log("Otherwise terminate the chain.");
    return res.end();
    
},
(req,res) => {
    console.log("This is the route handler, it's last in the middleware chain and doesn't use the next function.");
    return res.end();
});

/* GET 127.0.0.1:5000/ */
server.get("/", (req,res,next) => {
    console.log("Server level routing also supports middlewares.");
    next();
},
(req,res) => {
    console.log("End of the chain = route handler.");
    return res.end();
});

```

## Query Parameters

Use the req.query function to get the query parameters from the url

```javascript

const {Server} = require("http-server-simple");
const server = new Server();

/* GET 127.0.0.1:5000/?a=1&b=2 */
server.get("/", (req,res) => {
    const queries = req.query(); // returns {a: "1", b: "2"}
    const a = req.query("a"); //returns "1"
    const c = req.query("c"); //returns null
    return res.end();
})
.listen(5000,"127.0.0.1");

```

## Route parameters

Access the dictionary of route parameters with the req.params attribute

```javascript

const {Server} = require("http-server-simple");
const server = new Server();

/* GET 127.0.0.1:5000/user/:id */
server.get("/user/:id", (req,res) => {
    const id = req.params.id;

    return res.html(`<h1>This is user ${id}</h1>`);
})
.listen(5000,"127.0.0.1");

```

## Body parsing

Access the body of a POST,PUT or PATCH request with req.body. The body will be parsed depending on the Content-Type header. If the parsing failed, the Content-Type is invalid or no Content-Type was specified, req.body will be the raw data with the specified encoding.

<em>**For all other methods, req.body returns undefined**</em>

<span style="text-decoration: underline">***SERVER SIDE***</span>

```javascript
const {Server} = require("http-server-simple");
const server = new Server();
const users = require("./data/users");

/* PUT 127.0.0.1:5000/user/:id */
server.put("/user/:id", (req,res) => {
    const id = req.params.id;

    // {name: "bob", age: 10}
    const newData = req.body;

    users[id] = {...users[id], ...newData};

    return res.json(users[id]);
})
.listen(5000,"127.0.0.1");
```

<span style="text-decoration: underline">***CLIENT SIDE (using urlencoded)*** </span>

```javascript
fetch("http://127.0.0.1:5000/user/1", {
    method: "PUT",
    body: "name=bob&age=10",
    headers: {
        "Content-Type": "application/x-www-form-urlencoded"
    }
});

```

## Unhandled exceptions

A status code 500 and no content will be sent as a response if an uncaught exception happens in one of the middlewares or handlers

<span style="text-decoration: underline">***SERVER SIDE***</span>

```javascript
const {Server} = require("http-server-simple");
const server = new Server();

/* PUT 127.0.0.1:5000/exception */
server.get("/exception", (req,res) => {
    res.nonExistantFunction();
})
.listen(5000,"127.0.0.1");
```

<span style="text-decoration: underline">***CLIENT SIDE*** </span>

```javascript
const res = await fetch("http://127.0.0.1:5000/exception");

//true
console.log(res.status === 500);

```

## Download
Downloading a file from the disk can be done in two ways. the "low level" way is with the **res.download** method and the "high level" way is with the **Download** class helper.

**res.download** takes as argument a **File** object and, optionally, an object containing the start and end bytes that you would like to download.

<span style="text-decoration: underline">***SERVER SIDE***</span>

```javascript
const {Server, File} = require("http-server-simple");
const server = new Server();

/* PUT 127.0.0.1:5000/download */
server.get("/download", (req,res) => {
    //content of file: 0123456789
    const file = new File("path/to/a/file/that/exists");

    opts = {};
    if(req.query("start")) {
        opts.start = parseInt(req.query("start"));
    }
    if(req.query("end")) {
        opts.end = parseInt(req.query("end"));
    }

    return res.download(file, opts);
})
.listen(5000,"127.0.0.1");

```

<span style="text-decoration: underline">***CLIENT SIDE*** </span>

```javascript
let res = await fetch("http://127.0.0.1:5000/download");
let text = await res.text();

//0123456789, or it will download the file on a browser that respect the Content-Disposition header
console.log(text);
console.log(res.status); //200

res = await fetch("http://127.0.0.1:5000/download?start=2");
text = await res.text();

console.log(text); //23456789
console.log(res.status); //206

res = await fetch("http://127.0.0.1:5000/download?end=5");
text = await res.text();

console.log(text); //012345
console.log(res.status); //206

res = await fetch("http://127.0.0.1:5000/download?start=2&end=5");
text = await res.text();

console.log(text); //23456
console.log(res.status); //206

res = await fetch("http://127.0.0.1:5000/download?start=100");

//416, invalid range
console.log(res.status);

```

the **Download** class however only takes a **File** object or a string representing its path as argument. It looks at the Range header to determine what bytes to send.
 
 <span style="text-decoration: underline">***SERVER SIDE***</span>

```javascript
const {Server, Download} = require("http-server-simple");
const server = new Server();

/* PUT 127.0.0.1:5000/download */
server.get("/download", (req,res) => {
    //content of file: 0123456789
    const file = "path/to/a/file/that/exists";
    const downloader = new Download(req,res);

    return downloader.download(file);
})
.get("/resumableDownload", (req,res) => {
    const file = "path/to/a/file/that/exists";
    const downloader = new Download(req,res);

    return downloader.resumableDownload(file);
})
.listen(5000,"127.0.0.1");

```
<span style="text-decoration: underline">***CLIENT SIDE*** </span>

```javascript
let res = await fetch("http://127.0.0.1:5000/download");
let text = await res.text();

console.log(text); //0123456789
console.log(res.status); //200

res = await fetch("http://127.0.0.1:5000/download", {
    headers: {
        "Range": "bytes=2-"
    }
});
text = await res.text();

 //0123456789, the Range header was ignored because downloader.download() does not support resuming therefore it downloads the whole file.
console.log(text);
console.log(res.status); //200

res = await fetch("http://127.0.0.1:5000/resumableDownload", {
    headers: {
        "Range": "bytes=2-"
    }
});
text = await res.text();

console.log(text); //23456789
console.log(res.status) //206

```
